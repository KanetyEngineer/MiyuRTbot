import json
import re
from datetime import datetime 

read_since = '2020-04-01T00:00:00+09:00'

retweet_pattern = re.compile(r'RT .*\n$')
reply_pattern = re.compile(r'@[\w]+\s')
url_pattern = re.compile(r'https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+')

def exclude_specific_pattern(s: str):
    s = retweet_pattern.sub('', s)
    s = reply_pattern.sub('', s)
    s = url_pattern.sub('', s)
    return s

def escape_special_chars(s: str):
    return (s.replace('\n', '\\n'))

def is_newer_than(twitter_date_str: str, comparison_date: datetime):
    date_format = '%a %b %d %H:%M:%S %z %Y'
    parsed_date = datetime.strptime(twitter_date_str, date_format)
    return parsed_date > comparison_date

def load_tweets_json(tweets_js_file: str = 'tweets.js'):
    with open(tweets_js_file, 'r', encoding='utf-8') as file:
        content = file.read()
        cleaned_content = content.replace('window.YTD.tweets.part0 = ', '', 1)
    return json.loads(cleaned_content)

def write_tweets_txt(tweets_json, output_file: str = 'tweets.txt'):
    since_date = datetime.fromisoformat(read_since)
    with open(output_file, 'w', encoding='utf-8') as output:
        for tw in tweets_json:
            tweet = tw["tweet"]
            if not is_newer_than(tweet["created_at"], since_date):
                continue
            tweet_text = escape_special_chars(tweet["full_text"]) + '\n'
            tweet_text = exclude_specific_pattern(tweet_text)
            output.write(tweet_text)

if __name__ == '__main__':
    tweets_json = load_tweets_json()
    write_tweets_txt(tweets_json)
