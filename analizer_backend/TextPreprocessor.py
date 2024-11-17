import re
import emoji
import pymorphy2
from typing import List, Set, Tuple, Dict
from pymystem3 import Mystem
import pandas as pd
from nltk.corpus import stopwords
import nltk

class TextPreprocessor:
    def __init__(self):
        nltk.download('stopwords')
        nltk.download('punkt')
        self.morph = pymorphy2.MorphAnalyzer()
        self.mystem = Mystem()
        self.stop_words = self._load_stop_words()
        self.abbreviations = self._load_abbreviations()

    def _load_stop_words(self) -> Set[str]:
        """Load Russian stop words"""
        base_stops = set(stopwords.words('russian'))
        additional_stops = {
            'это', 'также', 'более', 'менее', 'очень', 'который', 'какой',
            'когда', 'где', 'зачем', 'почему', 'каким', 'какая', 'какое', 'какие'
        }
        return base_stops.union(additional_stops)

    def _load_abbreviations(self) -> Dict[str, str]:
        """Load Russian abbreviations"""
        return {
            'т.к.': 'так как',
            'т.е.': 'то есть',
            'и т.д.': 'и так далее',
            'и т.п.': 'и тому подобное',
            'др.': 'другие',
            'пр.': 'прочие',
            'см.': 'смотри',
            'напр.': 'например'
        }

    def process(self, text: str) -> str:
        """Main text processing pipeline"""
        if not text or pd.isna(text):
            return ""

        text = text.lower()
        text = self.expand_abbreviations(text)

        text = re.sub(r'http\S+|www.\S+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '', text)

        text = emoji.demojize(text)

        text = re.sub(r'[^\w\s-]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        words = text.split()
        lemmas = []
        for word in words:
            if len(word) > 2 and word not in self.stop_words:
                parsed = self.morph.parse(word)[0]
                if not parsed.tag.POS in {'PREP', 'CONJ', 'PRCL', 'INTJ'}:
                    lemmas.append(parsed.normal_form)

        return ' '.join(lemmas)

    def expand_abbreviations(self, text: str) -> str:
        """Expand Russian abbreviations"""
        for abbr, full_form in self.abbreviations.items():
            text = text.replace(abbr, full_form)
        return text