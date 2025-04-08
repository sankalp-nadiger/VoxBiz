import re
import nltk
import fastapi
import os
from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
from typing import List, Dict,Optional, Any
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Download necessary NLTK resources
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

app = FastAPI(title="Multilingual Voice-to-PostgreSQL Query System")

# Allow CORS for frontend communication
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request model
class QueryRequest(BaseModel):
    query: str
    schema: List[Dict[str, Any]]

class QueryResponse(BaseModel):
    query: Optional[str] = None  # generated SQL query
    result: Optional[Any] = None  # result from DB execution (optional)
    success: bool
    error: Optional[str] = None

# PostgreSQL schema retrieval endpoint (Node.js backend)
NODE_BACKEND_URL = "http://localhost:3000"  # Change to your Node.js backend URL

def fetch_database_schema():
    try:
        response = requests.get(f"{NODE_BACKEND_URL}/api/schema")
        response.raise_for_status()
        return response.json()  # Returns schema as a list of tables & columns
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error fetching schema: {str(e)}")

#Text processing
class TextPreprocessor:
    def __init__(self):
        self.stopwords = set(nltk.corpus.stopwords.words('english'))
        # Keep some question words that might be important for queries
        self.query_words = {'show', 'get', 'list', 'find', 'tell', 'give', 'what', 'which', 'when', 'where', 'how', 'many', 'top', 'by', 'in', 'between'}
        self.stopwords = self.stopwords - self.query_words
        self.lemmatizer = nltk.stem.WordNetLemmatizer()
    
    def clean_text(self, text):
        """Clean and normalize text for processing"""
        # Lowercase
        text = text.lower()
        
        # Remove punctuation but keep some special characters for SQL syntax
        text = re.sub(r'[^\w\s<>=!]', ' ', text)
        
        # Tokenize
        tokens = nltk.word_tokenize(text)
        
        # Remove stopwords but keep query-specific words
        filtered_tokens = [token for token in tokens if token not in self.stopwords or token in self.query_words]
        
        # Lemmatize
        lemmatized_tokens = [self.lemmatizer.lemmatize(token) for token in filtered_tokens]
        
        # Rejoin into text
        cleaned_text = ' '.join(lemmatized_tokens)
        return cleaned_text

# -------- 2. LANGUAGE DETECTION AND TRANSLATION MODULE --------
class LanguageProcessor:
    def detect_language(self, text):
        """
        Detect language of the text using common words or patterns
        In production, use a library like langdetect or call an API
        """
        # Simplified language detection with expanded language support
        english_words = {'show', 'get', 'list', 'find', 'what', 'which', 'orders', 'customers', 'products'}

        hindi_words = {'दिखाओ', 'प्राप्त', 'सूची', 'खोजें', 'क्या', 'कौन', 'आदेश', 'ग्राहक', 'उत्पाद'}
        kannada_words = {'ತೋರಿಸು', 'ಪಡೆ', 'ಪಟ್ಟಿ', 'ಹುಡುಕು', 'ಏನು', 'ಯಾವ', 'ಆದೇಶಗಳು', 'ಗ್ರಾಹಕರು', 'ಉತ್ಪನ್ನಗಳು'}
        
        text_lower = text.lower()
        tokens = set(text_lower.split())
        
        eng_count = len(tokens.intersection(english_words))
        hindi_count = len(tokens.intersection(hindi_words))
        kannada_count = len(tokens.intersection(kannada_words))
        
        # Detect script patterns (for better Hindi and Kannada detection)
        devanagari_pattern = re.compile(r'[\u0900-\u097F]')
        kannada_pattern = re.compile(r'[\u0C80-\u0CFF]')
        
        if devanagari_pattern.search(text):
            return "hi"  # Hindi
        elif kannada_pattern.search(text):
            return "kn"  # Kannada
        elif hindi_count > eng_count  and hindi_count > kannada_count:
            return "hi"
        elif kannada_count > eng_count  and kannada_count > hindi_count:
            return "kn"
        return "en"  # Default to English
    
    def translate_to_english(self, text, source_lang):
        """Translate text to English if needed using Google Translate API"""
        if source_lang == "en":
            return text
            
        try:
            # Call Google Translate API
            url = "https://translation.googleapis.com/language/translate/v2"
            params = {
                "q": text,
                "source": source_lang,
                "target": "en",
                "format": "text",
                "key": GOOGLE_API_KEY  # Using API key from environment variable
            }
            
            response = requests.post(url, params=params)
            if response.status_code == 200:
                return response.json()["data"]["translations"][0]["translatedText"]
            else:
                # Fallback to original text if translation fails
                print(f"Translation error: {response.status_code}, {response.text}")
                return text
        except Exception as e:
            print(f"Translation error: {e}")
            return text  # Return original text if translation fails

# -------- 3. ENHANCED INTENT PARSER MODULE --------
class EnhancedIntentParser:
    def __init__(self, schema, relationships, table_aliases, column_aliases, business_metrics, time_periods):
        self.schema = schema
        self.relationships = relationships
        self.table_aliases = table_aliases
        self.column_aliases = column_aliases
        self.business_metrics = business_metrics
        self.time_periods = time_periods
        
        # Define action patterns
        self.action_patterns = {
            "select": r'\b(show|list|display|get|find|search|select|query|retrieve|give me|what are|what is)\b',
            "count": r'\b(count|how many|total number|number of)\b',
            "average": r'\b(average|avg|mean|typical)\b',
            "sum": r'\b(sum|total|add up|overall)\b',
            "min": r'\b(minimum|min|smallest|lowest|least)\b',
            "max": r'\b(maximum|max|largest|highest|most|greatest)\b'
        }
        
        # Compile table name pattern from schema and aliases
        all_table_terms = list(self.schema.keys()) + list(self.table_aliases.keys())
        table_names = '|'.join(all_table_terms)
        self.table_pattern = re.compile(fr'\b({table_names})\b')
        
        # Compile join indicators
        self.join_pattern = re.compile(r'\b(with|along with|including|related|associated|linked to|joined with|from|and their|who have)\b')
        
        # Compile group by indicators
        self.group_pattern = re.compile(r'\b(group by|grouped by|per|by|categorized by|segmented by|broken down by)\b')
        
        # Build aggregation indicator pattern
        self.agg_pattern = re.compile(r'\b(total|average|count|sum|min|max|mean|highest|lowest)\b')
        
        # Build time period pattern
        time_period_terms = '|'.join(self.time_periods.keys())
        self.time_pattern = re.compile(fr'\b({time_period_terms})\b')
        
        # Build business metrics pattern
        metrics_terms = '|'.join(self.business_metrics.keys())
        self.metrics_pattern = re.compile(fr'\b({metrics_terms})\b')
    
    def normalize_table_name(self, table_term):
        """Convert potential table alias to actual table name"""
        if table_term in self.schema:
            return table_term
        if table_term in self.table_aliases:
            return self.table_aliases[table_term]
        # Try singular to plural conversion (simple English rule)
        if table_term + "s" in self.schema:
            return table_term + "s"
        return None
    
    def normalize_column_name(self, col_term, table=None):
        """Convert potential column alias to actual column name"""
        # Direct match
        for col, aliases in self.column_aliases.items():
            if col_term == col or col_term in aliases:
                return col
                
        # If table is specified, check columns for that table
        if table and table in self.schema:
            for col in self.schema[table]:
                if col_term in col or col in col_term:
                    return col
                    
        return col_term  # Return as is if no match
    
    def extract_action(self, text):
        """Extract the SQL action type (SELECT, COUNT, etc.)"""
        for action, pattern in self.action_patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                return action
        return "select"  # Default action
    
    def extract_tables(self, text):
        """Extract all mentioned tables and determine joins"""
        # Find all table mentions
        table_mentions = []
        for match in self.table_pattern.finditer(text):
            table_term = match.group(1)
            table_name = self.normalize_table_name(table_term)
            if table_name and table_name not in [t['name'] for t in table_mentions]:
                table_mentions.append({
                    'name': table_name,
                    'position': match.start()
                })
        
        # If no tables found explicitly, try to infer from business metrics
        if not table_mentions:
            for metric, _ in self.business_metrics.items():
                if metric in text:
                    # Map metrics to their primary tables
                    if any(term in metric for term in ['revenue', 'sales', 'income', 'orders', 'average order']):
                        table_mentions.append({'name': 'orders', 'position': 0})
                    elif any(term in metric for term in ['customer', 'client']):
                        table_mentions.append({'name': 'customers', 'position': 0})
                    elif any(term in metric for term in ['product', 'inventory']):
                        table_mentions.append({'name': 'products', 'position': 0})
                    break

        # If still no tables, look for column names to infer tables
        if not table_mentions:
            for col, aliases in self.column_aliases.items():
                for alias in [col] + aliases:
                    if re.search(fr'\b{alias}\b', text, re.IGNORECASE):
                        # Find which table this column belongs to
                        for table, columns in self.schema.items():
                            if any(c.split('_')[0] in col or col.split('_')[0] in c for c in columns):
                                table_mentions.append({'name': table, 'position': 0})
                                break

        # If still no tables found, default to most commonly queried table
        if not table_mentions:
            table_mentions.append({'name': 'orders', 'position': 0})
        
        # Sort by position in text to determine join order
        table_mentions.sort(key=lambda x: x['position'])
        
        # Determine if joins are needed
        tables = [t['name'] for t in table_mentions]
        
        # Determine join relationships if multiple tables
        joins = []
        if len(tables) > 1:
            for i in range(len(tables) - 1):
                left = tables[i]
                right = tables[i + 1]
                
                # Check direct relationship
                rel_key = (left, right)
                if rel_key in self.relationships:
                    joins.append({
                        'left_table': left,
                        'right_table': right,
                        'conditions': self.relationships[rel_key]
                    })
                    continue
                
                # Check reverse relationship
                rel_key = (right, left)
                if rel_key in self.relationships:
                    joins.append({
                        'left_table': left,
                        'right_table': right,
                        'conditions': self.relationships[rel_key]
                    })
                    continue
                
                # If no direct relationship, try to find intermediate table
                for middle in self.schema.keys():
                    if middle not in [left, right]:
                        left_mid_key = (left, middle)
                        mid_right_key = (middle, right)
                        
                        if left_mid_key in self.relationships and mid_right_key in self.relationships:
                            # Found intermediate relationship
                            joins.append({
                                'left_table': left,
                                'right_table': middle,
                                'conditions': self.relationships[left_mid_key]
                            })
                            joins.append({
                                'left_table': middle,
                                'right_table': right,
                                'conditions': self.relationships[mid_right_key]
                            })
                            break
        
        return tables, joins
    
    def extract_columns(self, text, tables):
        """Extract column names being queried"""
        if not tables:
            return ["*"]
            
        columns = []
        aggregations = []
        
        # Extract business metrics first (they have priority)
        for metric, sql_expr in self.business_metrics.items():
            if re.search(fr'\b{metric}\b', text, re.IGNORECASE):
                aggregations.append(f"{sql_expr} AS {metric.replace(' ', '_')}")
        
        # Extract explicit columns
        for table in tables:
            if table in self.schema:
                for col in self.schema[table]:
                    # Check for direct column mention
                    aliases = self.column_aliases.get(col, [col])
                    for alias in aliases:
                        if re.search(fr'\b{alias}\b', text, re.IGNORECASE):
                            columns.append(f"{table}.{col}")
                            break

        # Check for aggregation functions
        agg_functions = {
            'count': r'\b(count|how many|number of)\b',
            'avg': r'\b(average|avg|mean)\b',
            'sum': r'\b(sum|total|add up)\b',
            'min': r'\b(minimum|min|smallest|lowest)\b',
            'max': r'\b(maximum|max|largest|highest|greatest)\b'
        }
        
        for agg_func, pattern in agg_functions.items():
            if re.search(pattern, text, re.IGNORECASE):
                # If no specific columns for aggregation but we have a target table
                if not columns and tables:
                    if agg_func == 'count':
                        aggregations.append(f"COUNT(*) AS total_count")
                    else:
                        # Try to identify what to aggregate
                        for table in tables:
                            # For each table, find numeric columns that might be aggregated
                            numeric_cols = ['total_amount', 'price', 'quantity', 'stock_quantity']
                            for col in self.schema[table]:
                                if col in numeric_cols:
                                    aggregations.append(f"{agg_func.upper()}({table}.{col}) AS {agg_func}_{col}")
                # If we have columns, apply aggregation to them
                else:
                    new_columns = []
                    for col in columns:
                        # Only aggregate numeric columns
                        col_name = col.split('.')[-1]
                        if col_name in ['total_amount', 'price', 'quantity', 'stock_quantity', 'customer_id', 'order_id', 'product_id']:
                            if agg_func == 'count' and 'id' in col_name:
                                new_columns.append(f"COUNT(DISTINCT {col}) AS count_{col_name}")
                            else:
                                new_columns.append(f"{agg_func.upper()}({col}) AS {agg_func}_{col_name}")
                        else:
                            new_columns.append(col)
                    columns = new_columns
        
        # Combine regular columns and aggregations
        all_columns = columns + aggregations
        
        # If we have tables but no columns were extracted, return all columns from first table
        if tables and not all_columns:
            return [f"{tables[0]}.*"]
        
        # If we have aggregations but no regular columns, return just the aggregations
        if aggregations and not columns:
            return aggregations
            
        return all_columns if all_columns else ["*"]
    
    def extract_conditions(self, text, tables):
        """Extract WHERE clause conditions"""
        if not tables:
            return None
            
        conditions = []
        
        # First check for time period conditions
        for period, condition in self.time_periods.items():
            if re.search(fr'\b{period}\b', text, re.IGNORECASE):
                if 'orders' in tables:
                    conditions.append(condition)
                    break
        
        # Common comparison patterns
        comparison_patterns = [
            (r'(\w+)\s+is\s+(\w+)', "="),
            (r'(\w+)\s+equals\s+(\w+)', "="),
            (r'(\w+)\s+=\s+(\w+)', "="),
            (r'(\w+)\s+equal to\s+(\w+)', "="),
            (r'where\s+(\w+)\s+is\s+(\w+)', "="),
            (r'(\w+)\s+greater than\s+(\d+)', ">"),
            (r'(\w+)\s+more than\s+(\d+)', ">"),
            (r'(\w+)\s+above\s+(\d+)', ">"),
            (r'(\w+)\s+>\s+(\d+)', ">"),
            (r'(\w+)\s+less than\s+(\d+)', "<"),
            (r'(\w+)\s+below\s+(\d+)', "<"),
            (r'(\w+)\s+<\s+(\d+)', "<"),
            (r'(\w+)\s+at least\s+(\d+)', ">="),
            (r'(\w+)\s+at most\s+(\d+)', "<="),
            (r'(\w+)\s+not equal to\s+(\w+)', "!="),
            (r'(\w+)\s+!=\s+(\w+)', "!="),
            (r'(\w+)\s+different from\s+(\w+)', "!="),
        ]
        
        # Extract comparison conditions
        for pattern, operator in comparison_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                col_term, val = match.groups()
                
                # Find which table this column belongs to
                col_table = None
                col_name = None
                
                for table in tables:
                    normalized_col = self.normalize_column_name(col_term, table)
                    if normalized_col in self.schema.get(table, []):
                        col_table = table
                        col_name = normalized_col
                        break
                
                if col_table and col_name:
                    # Check if value needs quotes (string vs numeric)
                    try:
                        float(val)
                        conditions.append(f"{col_table}.{col_name} {operator} {val}")
                    except ValueError:
                        # Handle "status is completed" type queries
                        conditions.append(f"{col_table}.{col_name} {operator} '{val}'")
        
        # Handle date ranges - PostgreSQL specific date functions
        date_patterns = [
            r'(\w+)\s+between\s+(\w+)\s+and\s+(\w+)',
            r'(\w+)\s+from\s+(\w+)\s+to\s+(\w+)',
        ]
        
        for pattern in date_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                col_term, start, end = match.groups()
                
                # Find which table this column belongs to
                for table in tables:
                    normalized_col = self.normalize_column_name(col_term, table)
                    if normalized_col in self.schema.get(table, []):
                        # Use PostgreSQL date format
                        conditions.append(f"{table}.{normalized_col} BETWEEN '{start}'::date AND '{end}'::date")
                        break
        
        # Handle LIKE conditions for text search
        like_patterns = [
            r'(\w+)\s+contains\s+(\w+)',
            r'(\w+)\s+like\s+(\w+)',
            r'(\w+)\s+with\s+(\w+)\s+in it',
        ]
        
        for pattern in like_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                col_term, val = match.groups()
                
                # Find which table this column belongs to
                for table in tables:
                    normalized_col = self.normalize_column_name(col_term, table)
                    if normalized_col in self.schema.get(table, []):
                        conditions.append(f"{table}.{normalized_col} ILIKE '%{val}%'")  # PostgreSQL uses ILIKE for case-insensitive
                        break
        
        # Add status-based conditions
        status_patterns = [
            r'(\w+)\s+status\s+is\s+(\w+)',
            r'status\s+is\s+(\w+)',
            r'(\w+)\s+orders',
        ]
        
        status_values = {
            'complete': 'completed',
            'completed': 'completed',
            'pending': 'pending',
            'shipped': 'shipped',
            'cancelled': 'cancelled',
            'canceled': 'cancelled',
            'processing': 'processing',
            'new': 'new',
            'delivered': 'delivered'
        }
        
        for pattern in status_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                groups = match.groups()
                status_val = None
                
                if len(groups) == 1:
                    status_val = groups[0]
                elif len(groups) == 2:
                    status_val = groups[1]
                
                if status_val and status_val.lower() in status_values:
                    normalized_status = status_values[status_val.lower()]
                    if 'orders' in tables:
                        conditions.append(f"orders.status = '{normalized_status}'")
        
        # Handle top/bottom N conditions (these will be moved to LIMIT and ORDER BY later)
        top_patterns = [
            r'top\s+(\d+)',
            r'best\s+(\d+)',
            r'highest\s+(\d+)',
        ]
        
        bottom_patterns = [
            r'bottom\s+(\d+)',
            r'worst\s+(\d+)',
            r'lowest\s+(\d+)',
        ]
        
        for pattern in top_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                # This will be handled by extract_limit and extract_order
                pass
                
        for pattern in bottom_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                # This will be handled by extract_limit and extract_order
                pass
        
        return " AND ".join(conditions) if conditions else None
    
    def extract_group_by(self, text, tables, columns):
        """Extract GROUP BY clause if present"""
        group_columns = []
        
        # Check for grouping indicators
        has_grouping = self.group_pattern.search(text)
        
        # If no explicit grouping but we have aggregations, try to infer groups
        has_aggregation = self.agg_pattern.search(text)
        
        if has_grouping or has_aggregation:
            # Look for potential grouping columns
            group_candidates = []
            
            # Common grouping candidates by table
            grouping_candidates = {
                'customers': ['name', 'customer_id'],
                'orders': ['status', 'order_date'],
                'products': ['category', 'name', 'product_id'],
                'order_items': ['product_id']
            }
            
            # Start by finding mentioned columns that might be groups
            for table in tables:
                if table in grouping_candidates:
                    for candidate in grouping_candidates[table]:
                        # Check if it's mentioned in the text or in selected columns
                        col_in_text = any(re.search(fr'\b{alias}\b', text, re.IGNORECASE) 
                                      for alias in self.column_aliases.get(candidate, [candidate]))
                        
                        col_in_selection = f"{table}.{candidate}" in columns
                        
                        if col_in_text or col_in_selection:
                            group_columns.append(f"{table}.{candidate}")
            
            # Time-based grouping using PostgreSQL date functions
            time_groups = {
                'daily': "DATE(orders.order_date)",
                'day': "DATE(orders.order_date)",
                'monthly': "DATE_TRUNC('month', orders.order_date)",
                'month': "DATE_TRUNC('month', orders.order_date)",
                'yearly': "DATE_TRUNC('year', orders.order_date)",
                'year': "DATE_TRUNC('year', orders.order_date)",
                'quarterly': "DATE_TRUNC('quarter', orders.order_date)",
                'quarter': "DATE_TRUNC('quarter', orders.order_date)",
                'weekly': "DATE_TRUNC('week', orders.order_date)",
                'week': "DATE_TRUNC('week', orders.order_date)"
            }
            
            for term, expr in time_groups.items():
                if re.search(fr'\b{term}\b', text, re.IGNORECASE) and 'orders' in tables:
                    group_columns.append(expr)
            
            # If we still have no groups but need them due to aggregations, use default grouping
            if not group_columns and has_aggregation:
                # Find non-aggregated columns to group by
                for col in columns:
                    if not any(agg in col.lower() for agg in ['count(', 'sum(', 'avg(', 'min(', 'max(']):
                        group_columns.append(col)
        
        return group_columns if group_columns else None
    
def extract_having(self, text, group_by_cols):
    """Extract HAVING clause if present"""
    if not group_by_cols:
        return None

    having_conditions = []

    # Common having patterns
    having_patterns = [
        (r'having\s+(\w+)\s+greater than\s+(\d+)', "{} > {}"),
        (r'having\s+(\w+)\s+>\s+(\d+)', "{} > {}"),
        (r'having\s+(\w+)\s+less than\s+(\d+)', "{} < {}"),
        (r'having\s+(\w+)\s+<\s+(\d+)', "{} < {}"),
        (r'having\s+(\w+)\s+at least\s+(\d+)', "{} >= {}"),
        (r'having\s+(\w+)\s+at most\s+(\d+)', "{} <= {}"),
        (r'having\s+(\w+)\s+=\s+(\d+)', "{} = {}"),
        (r'having\s+(\w+)\s+equals?\s+(\d+)', "{} = {}"),
        (r'where\s+total\s+(\w+)\s+is\s+greater than\s+(\d+)', "SUM({}) > {}"),
        (r'where\s+total\s+(\w+)\s+is\s+less than\s+(\d+)', "SUM({}) < {}"),
        (r'where\s+average\s+(\w+)\s+is\s+greater than\s+(\d+)', "AVG({}) > {}"),
        (r'where\s+average\s+(\w+)\s+is\s+less than\s+(\d+)', "AVG({}) < {}")
    ]

    for pattern, template in having_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            col_term, val = match.groups()

            # Infer aggregation function from pattern
            agg_func = None
            if 'total' in pattern:
                agg_func = 'SUM'
            elif 'average' in pattern:
                agg_func = 'AVG'
            elif 'count' in pattern:
                agg_func = 'COUNT'

            # Try to map column to an actual column
            for table in self.schema:
                for col in self.schema[table]:
                    if col_term in col or col in col_term:
                        if agg_func:
                            condition = template.format(f"{agg_func}({table}.{col})", val)
                        else:
                            # Try to infer aggregation from text
                            if 'total' in text.lower() and text.lower().index('total') < text.lower().index(col_term):
                                condition = template.format(f"SUM({table}.{col})", val)
                            elif 'average' in text.lower() and text.lower().index('average') < text.lower().index(col_term):
                                condition = template.format(f"AVG({table}.{col})", val)
                            elif 'count' in text.lower() and text.lower().index('count') < text.lower().index(col_term):
                                condition = template.format(f"COUNT({table}.{col})", val)
                            else:
                                condition = template.format(f"{table}.{col}", val)
                        having_conditions.append(condition)
                        break

    # Handle "more/less than X items/orders" patterns for COUNT aggregates
    count_patterns = [
        (r'with\s+more than\s+(\d+)\s+(\w+)', "COUNT({}) > {}"),
        (r'with\s+at least\s+(\d+)\s+(\w+)', "COUNT({}) >= {}"),
        (r'with\s+less than\s+(\d+)\s+(\w+)', "COUNT({}) < {}"),
        (r'who\s+ordered\s+more than\s+(\d+)\s+times', "COUNT(orders.order_id) > {}")
    ]

    for pattern, template in count_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            groups = match.groups()
            val = groups[0]

            if len(groups) > 1:
                item_term = groups[1]
                # Map item term to table
                if item_term in ['order', 'orders', 'purchase', 'purchases']:
                    having_conditions.append(template.format("orders.order_id", val))
                elif item_term in ['item', 'items', 'product', 'products']:
                    having_conditions.append(template.format("order_items.item_id", val))
            else:
                # Default count condition
                having_conditions.append(template.format("*", val))

    return " AND ".join(having_conditions) if having_conditions else None

def extract_limit(self, text):
    """Extract LIMIT clause if present"""
    limit_patterns = [
        r'\blimit\s+(\d+)\b',
        r'\btop\s+(\d+)\b',
        r'\bfirst\s+(\d+)\b',
        r'\bbottom\s+(\d+)\b',
        r'\blast\s+(\d+)\b',
        r'\bhighest\s+(\d+)\b',
        r'\blowest\s+(\d+)\b',
        r'\bbest\s+(\d+)\b',
        r'\bworst\s+(\d+)\b',
    ]
    
    for pattern in limit_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    
    return None

def extract_order(self, text, columns):
    """Extract ORDER BY clause if present"""
    order_columns = []
    
    # Direction patterns
    asc_patterns = [r'\bascending\b', r'\bincrease\b', r'\bascend\b', r'\brise\b']
    desc_patterns = [r'\bdescending\b', r'\bdecrease\b', r'\bdescend\b', r'\bdrop\b', r'\bhighest\b', r'\bbest\b', r'\btop\b']
    
    # Detect default direction
    direction = "ASC"  # Default
    for pattern in desc_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            direction = "DESC"
            break
    
    # Order by patterns
    order_patterns = [
        r'order\s+by\s+(\w+)',
        r'sort\s+by\s+(\w+)',
        r'arranged\s+by\s+(\w+)',
        r'ranked\s+by\s+(\w+)',
    ]
    
    # Extract explicit order columns
    explicit_order = False
    for pattern in order_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            explicit_order = True
            col_term = match.group(1)
            
            # Try to map to a real column
            matched = False
            for table in self.schema:
                for col in self.schema[table]:
                    if col_term in col or col in col_term:
                        order_columns.append(f"\"{table}\".\"{col}\" {direction}")
                        matched = True
                        break
                if matched:
                    break
            
            # If not matched to a column, check for aggregates
            if not matched:
                agg_indicators = {
                    'total': 'SUM',
                    'sum': 'SUM',
                    'average': 'AVG',
                    'avg': 'AVG',
                    'count': 'COUNT',
                    'number': 'COUNT',
                }
                
                for indicator, agg_func in agg_indicators.items():
                    if indicator in text.lower():
                        for table in self.schema:
                            for col in self.schema[table]:
                                if col_term in col or col in col_term:
                                    order_columns.append(f"{agg_func}(\"{table}\".\"{col}\") {direction}")
                                    matched = True
                                    break
                            if matched:
                                break
    
    # If not explicit but we have indicators for ordering
    if not explicit_order:
        # Top/Bottom indicators
        top_patterns = [r'top\s+\d+', r'highest\s+\d+', r'best\s+\d+', r'most\s+\d+']
        bottom_patterns = [r'bottom\s+\d+', r'lowest\s+\d+', r'worst\s+\d+', r'least\s+\d+']
        
        for pattern in top_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                # Find measure to sort by
                for metric in ['revenue', 'sales', 'amount', 'price', 'quantity']:
                    if metric in text.lower():
                        if metric in ['revenue', 'sales']:
                            order_columns.append(f"\"orders\".\"total_amount\" DESC")
                        elif metric == 'amount':
                            order_columns.append(f"\"orders\".\"total_amount\" DESC")
                        elif metric == 'price':
                            if 'products' in text.lower():
                                order_columns.append(f"\"products\".\"price\" DESC")
                            else:
                                order_columns.append(f"\"order_items\".\"price\" DESC")
                        elif metric == 'quantity':
                            order_columns.append(f"\"order_items\".\"quantity\" DESC")
                        break
                
                # If no specific metric found, use a default
                if not order_columns:
                    if 'customer' in text.lower():
                        order_columns.append(f"COUNT(\"orders\".\"order_id\") DESC")
                    elif 'product' in text.lower():
                        order_columns.append(f"SUM(\"order_items\".\"quantity\") DESC")
                    else:
                        order_columns.append(f"\"orders\".\"total_amount\" DESC")
                break
        
        for pattern in bottom_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                # Find measure to sort by
                for metric in ['revenue', 'sales', 'amount', 'price', 'quantity']:
                    if metric in text.lower():
                        if metric in ['revenue', 'sales']:
                            order_columns.append(f"\"orders\".\"total_amount\" ASC")
                        elif metric == 'amount':
                            order_columns.append(f"\"orders\".\"total_amount\" ASC")
                        elif metric == 'price':
                            if 'products' in text.lower():
                                order_columns.append(f"\"products\".\"price\" ASC")
                            else:
                                order_columns.append(f"\"order_items\".\"price\" ASC")
                        elif metric == 'quantity':
                            order_columns.append(f"\"order_items\".\"quantity\" ASC")
                        break
                
                # If no specific metric found, use a default
                if not order_columns:
                    if 'customer' in text.lower():
                        order_columns.append(f"COUNT(\"orders\".\"order_id\") ASC")
                    elif 'product' in text.lower():
                        order_columns.append(f"SUM(\"order_items\".\"quantity\") ASC")
                    else:
                        order_columns.append(f"\"orders\".\"total_amount\" ASC")
                break
    
    # If we detected need for ordering but couldn't determine column, use reasonable defaults
    if (any(term in text.lower() for term in ['top', 'highest', 'best', 'bottom', 'lowest', 'worst']) and 
        not order_columns):
        
        if 'recent' in text.lower() and any(table in ['orders'] for table in self.schema):
            order_columns.append(f"\"orders\".\"order_date\" DESC")
        elif any(metric in text.lower() for metric in ['sales', 'revenue', 'amount']):
            order_columns.append(f"\"orders\".\"total_amount\" DESC")
        elif 'price' in text.lower():
            order_columns.append(f"\"products\".\"price\" DESC")
    
    return ", ".join(order_columns) if order_columns else None

def generate_sql(self, intent):
    """Generate PostgreSQL query from parsed intent"""
    if not intent or not intent.get("tables"):
        return "ERROR: Could not determine target table from input."
    
    # Start building the query
    columns = ", ".join([f"\"{col}\"" if "." not in col and "(" not in col else col for col in intent.get("columns", ["*"])])
    tables = intent.get("tables", [])
    joins = intent.get("joins", [])
    
    # Build FROM clause
    from_clause = f"\"{tables[0]}\""  # Start with the first table
    
    # Add JOIN clauses if needed
    join_clauses = []
    processed_tables = {tables[0]}
    
    if joins:
        for join in joins:
            left = join.get("left_table")
            right = join.get("right_table")
            conditions = join.get("conditions", {})
            
            # Skip if we've already included both tables
            if left in processed_tables and right in processed_tables:
                continue
            
            # Determine which table to join next
            if left in processed_tables and right not in processed_tables:
                next_table = right
                join_table = left
            elif right in processed_tables and left not in processed_tables:
                next_table = left
                join_table = right
            else:
                # If neither table is processed yet, follow the order in the joins list
                if tables.index(left) < tables.index(right):
                    from_clause = f"\"{left}\""
                    next_table = right
                    join_table = left
                    processed_tables.add(left)
                else:
                    from_clause = f"\"{right}\""
                    next_table = left
                    join_table = right
                    processed_tables.add(right)
            
            # Build the JOIN condition
            on_conditions = []
            for left_col, right_col in conditions.items():
                on_conditions.append(f"{left_col} = {right_col}")
            
            join_clause = f"JOIN \"{next_table}\" ON {' AND '.join(on_conditions)}"
            join_clauses.append(join_clause)
            processed_tables.add(next_table)
    
    # Final FROM clause with JOINS
    if join_clauses:
        from_clause = f"{from_clause} {' '.join(join_clauses)}"
    
    # Start building the query
    sql = f"SELECT {columns} FROM {from_clause}"
    
    # Add WHERE clause if conditions exist
    if intent.get("where"):
        sql += f" WHERE {intent.get('where')}"
    
    # Add GROUP BY clause if specified
    if intent.get("group_by"):
        group_by_cols = ", ".join([f"\"{col}\"" if "." not in col else col for col in intent.get("group_by")])
        sql += f" GROUP BY {group_by_cols}"
    
    # Add HAVING clause if specified
    if intent.get("having"):
        sql += f" HAVING {intent.get('having')}"
    
    # Add ORDER BY clause if specified
    if intent.get("order"):
        sql += f" ORDER BY {intent.get('order')}"
    
    # Add LIMIT clause if specified
    if intent.get("limit"):
        sql += f" LIMIT {intent.get('limit')}"
    
    return sql


# -------- API ROUTES --------
@app.post("/process-query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """Process a natural language query and return SQL results"""
    try:
        # Initialize pipeline components
        preprocessor = TextPreprocessor()
        language_processor = LanguageProcessor()
        intent_parser = EnhancedIntentParser(
            DB_SCHEMA,
            TABLE_RELATIONSHIPS,
            TABLE_ALIASES,
            COLUMN_ALIASES,
            BUSINESS_METRICS,
            TIME_PERIODS
        )
        sql_generator = EnhancedSQLGenerator()

        # Process the input text
        text = request.text

        # Detect language and translate if necessary
        detected_lang = language_processor.detect_language(text)
        if detected_lang != "en":
            text = language_processor.translate_to_english(text, detected_lang)

        # Clean and preprocess text
        cleaned_text = preprocessor.clean_text(text)

        # Parse intent
        intent = intent_parser.parse_intent(cleaned_text)

        # Generate SQL
        sql = sql_generator.generate_sql(intent)

        # For debugging or when only the SQL is needed without execution
        if "generate_only" in text.lower() or "sql_only" in text.lower():
            return QueryResponse(
                query=sql,
                success=True
            )

        # Otherwise, execute query (you can add execution logic here if needed)
        # result = your_database_interface.execute(sql)
        # return QueryResponse(query=sql, result=result, success=True)

    except Exception as e:
        return QueryResponse(
            query=None,
            success=False,
            error=str(e)
        )