Wormwood can process a subset of SQL select queries, of the form:

```sql
SELECT select_list 
FROM table_expression
[WHERE search_condition]
[ORDER BY order_by_expression]
```

## select_list

```sql
column_name[, ...]
```

or 

```sql 
mean column_name
```

* a select query may select a single column from a data source
* a select query may select multiple columns from a data source
* a select query may select the mean aggregation of a single numeric column of a data source

## table_expression

Table expression must be the name (without extension) of a `.clef` text file in the `/data` directory containing newline delimited JSON objects.

## search_condition

A predicate expression comparing exactly one column to a constant value. The constant value may be any that can be parsed as JSON. The column must be present in the select list.

```sql
field_name = constant
```

* when a WHERE clause is present the query only returns rows for which the predicate is true
* it is possible to have a WHERE clause on a mean aggregate query

## order_by_expression

```sql
column_name ASC|DESC
```

Only one column name is allowed. Sort direction must be specified. Column must be numeric. 