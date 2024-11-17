from Ai1 import combine_column, clean_text, uniform_color_func, word_cloud, min_cluster_size, analyze_sentiment_for_dataframe, deep_learn_analizer
from MixedDataClusterer import MixedDataClusterer
import pandas as pd

df = pd.read_csv("uploads/test.csv")

list=["City"]

cust=df[list]

clusterer = MixedDataClusterer(vector_size=200, min_cluster_size=min_cluster_size(cust.shape[0],"linear"))
use_tonal = False
if use_tonal:
    cust=deep_learn_analizer(cust)

labels, descriptions = clusterer.fit_predict(cust)

cust['cluster'] = labels
print(descriptions) #словарь

word_cloud(cust) #