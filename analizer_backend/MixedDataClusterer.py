from typing import List, Set, Tuple, Dict
from sklearn.preprocessing import StandardScaler
from sentence_transformers import SentenceTransformer
import umap
from hdbscan import HDBSCAN
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from transformers import pipeline, BertTokenizer, BertForSequenceClassification
from TextPreprocessor import TextPreprocessor


class MixedDataClusterer:
    def __init__(self, vector_size: int = 100, min_cluster_size: int = 5):
        """Initialize clusterer with settings"""
        self.vector_size = vector_size
        self.text_preprocessor = TextPreprocessor()
        self.numeric_scaler = StandardScaler()
        self.clusterer = HDBSCAN(
            min_cluster_size=min_cluster_size,
            min_samples=3,
            metric='euclidean',
            cluster_selection_epsilon=0.1
        )
        # Multilingual BERT
        self.bert_model = SentenceTransformer('symanto/sn-xlm-roberta-base-snli-mnli-anli-xnli')

    def fit_transform_numeric(self, df: pd.DataFrame) -> Tuple[np.ndarray, Dict[str, dict]]:
        """Transform numeric features and calculate statistics"""
        numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns
        if len(numeric_cols) == 0:
            return np.array([]), {}

        numeric_features = self.numeric_scaler.fit_transform(df[numeric_cols])

        stats = {}
        for col in numeric_cols:
            stats[col] = {
                'mean': df[col].mean(),
                'std': df[col].std(),
                'median': df[col].median(),
                'q1': df[col].quantile(0.25),
                'q3': df[col].quantile(0.75)
            }

        return numeric_features, stats

    def extract_keywords(self, texts: List[str]) -> List[str]:
        """Extract keywords using BERT embeddings and TF-IDF"""
        if not texts:
            return []

        vectorizer = TfidfVectorizer(max_features=100)
        tfidf_matrix = vectorizer.fit_transform(texts)


        embeddings = self.bert_model.encode(texts, show_progress_bar=False)


        centroid = np.mean(embeddings, axis=0)
        similarities = cosine_similarity([centroid], embeddings)[0]
        central_idx = similarities.argsort()[-3:][::-1]

        keywords = []
        feature_names = vectorizer.get_feature_names_out()

        for idx in central_idx:
            text_vector = tfidf_matrix[idx].toarray()[0]
            top_word_idx = text_vector.argsort()[-2:][::-1]
            keywords.extend([feature_names[i] for i in top_word_idx])

        return list(set(keywords))

    def get_cluster_summary(self,
                          cluster_data: pd.DataFrame,
                          numeric_stats: dict,
                          text_keywords: list) -> str:
        """Generate concise cluster summary"""
        summary_parts = []

        for col, stats in numeric_stats.items():
            cluster_mean = cluster_data[col].mean()
            cluster_std = cluster_data[col].std()

            if cluster_std < cluster_mean * 0.1:
                summary_parts.append(f"стабильный {col}")
            elif cluster_mean > stats['mean'] + stats['std']:
                summary_parts.append(f"высокий {col}")
            elif cluster_mean < stats['mean'] - stats['std']:
                summary_parts.append(f"низкий {col}")

        if text_keywords:
            summary_parts.extend(text_keywords[:2])

        return " + ".join(summary_parts[:3])

    def generate_cluster_descriptions(self,
                                   df: pd.DataFrame,
                                   labels: np.ndarray,
                                   global_stats: Dict[str, dict]) -> Dict[int, Dict]:
        """Generate detailed cluster descriptions"""
        descriptions = {}

        for label in set(labels):
            if label == -1:
                descriptions[label] = {
                    'summary': "Шумовые точки",
                    'features': ["Точки, не входящие в основные кластеры"]
                }
                continue

            cluster_mask = labels == label
            cluster_df = df[cluster_mask]


            numeric_desc = []
            for col, stats in global_stats.items():
                values = cluster_df[col]
                cluster_stats = {
                    'mean': values.mean(),
                    'std': values.std(),
                    'median': values.median()
                }

                if cluster_stats['std'] < cluster_stats['mean'] * 0.1:
                    numeric_desc.append(f"{col}: {cluster_stats['median']:.2f} (стабильно)")
                else:
                    numeric_desc.append(
                        f"{col}: {cluster_stats['mean']:.2f} ± {cluster_stats['std']:.2f}"
                    )


            text_cols = df.select_dtypes(include=['object']).columns
            text_keywords = []
            if len(text_cols) > 0:
                combined_texts = []
                for _, row in cluster_df.iterrows():
                    text_parts = [str(row[col]) for col in text_cols]
                    processed_text = self.text_preprocessor.process(' '.join(text_parts))
                    if processed_text:
                        combined_texts.append(processed_text)
                text_keywords = self.extract_keywords(combined_texts)


            summary = self.get_cluster_summary(cluster_df, global_stats, text_keywords)


            feature_desc = numeric_desc
            if text_keywords:
                feature_desc.append(f"Ключевые слова: {', '.join(text_keywords)}")

            descriptions[label] = {
                'summary': summary,
                'features': feature_desc
            }

        return descriptions

    def print_cluster_analysis(self, df: pd.DataFrame,
                             labels: np.ndarray,
                             descriptions: Dict[int, Dict]):
        """Print formatted cluster analysis"""
        print("\nАнализ кластеров:")

        for label in sorted(set(labels)):
            desc = descriptions[label]
            cluster_size = sum(labels == label)

            print(f"\nКластер {label}:")
            print(f"Общее описание: {desc['summary']}")
            print(f"Размер кластера: {cluster_size}")
            print("\nХарактеристики:")
            for feature in desc['features']:
                print(f"- {feature}")

    def visualize_clusters(self, features: np.ndarray, labels: np.ndarray):
        """cluster visualization"""
        if features.shape[1] > 2:
            reducer = umap.UMAP(
                n_components=2,
                random_state=42,
                min_dist=0.1,
                n_neighbors=15
            )
            coords = reducer.fit_transform(features)
        else:
            coords = features

        plt.figure(figsize=(12, 8))
        unique_labels = np.unique(labels)
        colors = plt.cm.Spectral(np.linspace(0, 1, len(unique_labels)))

        for label, color in zip(unique_labels, colors):
            mask = labels == label
            plt.scatter(
                coords[mask, 0],
                coords[mask, 1],
                c=[color],
                label=f'Кластер {label}' if label != -1 else 'Шум',
                alpha=0.7
            )

        plt.legend()
        plt.title('Визуализация кластеров')
        plt.tight_layout()
        plt.show()

    def fit_predict(self, df: pd.DataFrame) -> Tuple[np.ndarray, Dict[int, Dict]]:
        """Perform clustering and generate analysis"""

        numeric_features, global_stats = self.fit_transform_numeric(df)

        text_cols = df.select_dtypes(include=['object']).columns
        if len(text_cols) > 0:
            combined_text = pd.Series()
            for col in text_cols:
                combined_text = combined_text.add(df[col].astype(str), fill_value='')

            processed_texts = [
                self.text_preprocessor.process(text) for text in combined_text
            ]
            text_vectors = self.bert_model.encode(
                processed_texts,
                show_progress_bar=False
            )
        else:
            text_vectors = np.array([])


        features_list = []
        if len(numeric_features) > 0:
            features_list.append(numeric_features)
        if len(text_vectors) > 0:
            features_list.append(text_vectors)

        features = np.hstack(features_list) if features_list else np.array([])


        if features.shape[1] > 50:
            reducer = umap.UMAP(n_components=50, random_state=42)
            features = reducer.fit_transform(features)


        labels = self.clusterer.fit_predict(features)


        descriptions = self.generate_cluster_descriptions(df, labels, global_stats)


        #self.visualize_clusters(features, labels)

        #self.print_cluster_analysis(df, labels, descriptions)

        return labels, descriptions