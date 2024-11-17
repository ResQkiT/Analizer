import re
from typing import List, Set, Tuple, Dict
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from wordcloud import WordCloud
from collections import Counter
from transformers import pipeline, BertTokenizer, BertForSequenceClassification
import os

def combine_column(df, new_column_name="Combined", new_column_name2="Combined2"):
    df_new = pd.DataFrame()

    df_new[new_column_name] = df.apply(
        lambda row: ', '.join(row.astype(str).str.capitalize()), axis=1
    )

    return df_new

def clean_text(sentence):
    """
    Очищает текст от цифр и всех знаков препинания, кроме запятых.
    """
    return re.sub(r'[^\w\s,]', '', re.sub(r'\d+', '', sentence))

def uniform_color_func(word, font_size, position, orientation, random_state=None, **kwargs):
    return "royalblue"

import os
from collections import Counter
from wordcloud import WordCloud
import matplotlib.pyplot as plt

def word_cloud(df, user_folder):
    """
    Генерирует облака слов для каждого кластера с автоматическим определением параметров.
    Создает директорию, если она не существует.
    """
    # Создание директории, если она отсутствует
    if not os.path.exists(user_folder):
        os.makedirs(user_folder)

    df_new = combine_column(df)
    df_new["cluster"] = df["cluster"]
    df_new["word"] = df_new["Combined"].apply(clean_text)

    # Разделение текста на слова
    df_new['Word'] = df_new['word'].apply(lambda x: x.split(', '))

    for cluster, group in df_new.groupby('cluster'):
        used_words = set()
        word_counts = Counter()
        total_rows = len(group)

        # Подсчет частоты слов
        for words in group['Word']:
            unique_words = set(words)
            word_counts.update(unique_words)

        # Автоматическое определение порога процента
        if total_rows >= 100:
            percentage_threshold = 0.9  # Для больших кластеров
        elif total_rows >= 70:
            percentage_threshold = 0.8  # Для средних кластеров
        elif total_rows >= 40:
            percentage_threshold = 0.5
        elif total_rows >= 10:
            percentage_threshold = 0.2
        else:
            percentage_threshold = 0

        # Фильтрация слов по частоте
        frequent_words = {
            word: count for word, count in word_counts.items()
            if count / total_rows >= percentage_threshold and word not in used_words
        }

        # Гарантируем минимальное количество слов
        if len(frequent_words) < 2:
            # Если слов меньше 2, добавляем наиболее частые слова
            frequent_words = dict(word_counts.most_common(2))

        # Если слов всё ещё недостаточно, пропускаем кластер
        if len(frequent_words) < 2:
            continue

        # Добавляем слова в список использованных
        used_words.update(frequent_words.keys())

        # Генерация облака слов
        wordcloud = WordCloud(
            width=800,
            height=400,
            background_color='whitesmoke',
            color_func=uniform_color_func,
            colormap='tab10',
            relative_scaling=0
        ).generate_from_frequencies(frequent_words)

        # Визуализация
        plt.figure(figsize=(10, 5))
        plt.imshow(wordcloud, interpolation="bilinear")
        plt.axis("off")
        plt.title(f"Word Cloud for Cluster {cluster}")

        # Сохранение облака
        file_path = os.path.join(user_folder, f'word_cloud_cluster_{cluster}.png')
        plt.savefig(file_path, bbox_inches='tight')
        plt.close()

        print(f"Word cloud for cluster {cluster} saved at {file_path}")




def min_cluster_size(df_size, method="linear", a=0.05, b=5, c=1):
    if method == "linear":
        return max(int(a * df_size), b)
    elif method == "log":
        return max(int(c * np.log(df_size)), b)
    else:
        raise ValueError("Unsupported method. Use 'linear' or 'log'.")
    
def analyze_sentiment_for_dataframe(df, sentiment_pipeline):
    """
    Анализ тональности текста в DataFrame.
    """
    results = []
    for text in df:
        text = text[:511]
        result = sentiment_pipeline(text)
        label, score = result[0]['label'], result[0]['score']
        results.append((label, score))
    return results

def deep_learn_analizer(df):
    """
    Анализ тональности для текста из последнего столбца DataFrame и добавление результатов.
    """
    last_column = df.iloc[:, -1]
    last_column = last_column.fillna("0")


    model_name = "blanchefort/rubert-base-cased-sentiment"
    tokenizer = BertTokenizer.from_pretrained(model_name)
    model = BertForSequenceClassification.from_pretrained(model_name)
    sentiment_pipeline = pipeline("sentiment-analysis", model=model, tokenizer=tokenizer)


    sentiment_results = analyze_sentiment_for_dataframe(last_column, sentiment_pipeline)



    label_to_numeric = {'NEUTRAL': 0, 'POSITIVE': 1, 'NEGATIVE': -1}
    numeric_scores = [label_to_numeric[label] for label, _ in sentiment_results]


    df.insert(0, 'sentiment_label', numeric_scores)

    sentiment_counts = pd.Series([label for label, _ in sentiment_results]).value_counts()

    return  df

def get_cluster_analysis_output(df: pd.DataFrame, labels: np.ndarray, descriptions: Dict[int, Dict]) -> str:
    """Generate formatted cluster analysis as a string"""
    output = []
    output.append("Анализ кластеров:")

    for label in sorted(set(labels)):
        desc = descriptions[label]
        cluster_size = sum(labels == label)

        output.append(f"\nКластер {label}:")
        output.append(f"Общее описание: {desc['summary']}")
        output.append(f"Размер кластера: {cluster_size}")
        output.append("\nХарактеристики:")
        for feature in desc['features']:
            output.append(f"- {feature}")

    return "\n".join(output)