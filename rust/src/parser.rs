use serde_json::Value;

#[derive(PartialEq,Debug)]
struct EqualityPredicate {
    property_name: String,
    value: Value,
}

pub fn select_list_p(input: String) -> (Vec<String>, String) {
    let input = consume_leading_whitespace(input);
    if !input.to_lowercase().starts_with("select ") {
        return (vec![], input);
    }

    let mut trimmed = consume_leading_whitespace(consume_chars(input, "select "));
    
    let cols: String = trimmed.chars().take_while(|c| !c.is_whitespace()).collect();
    trimmed = consume_leading_whitespace(consume_chars(trimmed, &cols));
    (
        cols.split(",").map(|i| String::from(i)).collect::<Vec<String>>(), 
        trimmed
    )
}

pub fn source_p(input: String) -> (String, String) {
    if !input.to_lowercase().starts_with("from ") {
        return (String::from(""), input);
    }
    let trimmed = consume_leading_whitespace(consume_chars(input, "from "));
    word_p(trimmed)
}

pub fn filter_p(input: String) -> (Option<EqualityPredicate>, String) {
    let (prelude, mut rest) = chars_p(input, "where ");
    if prelude.len() == 0 {
        return (None, rest);
    }

    rest = consume_leading_whitespace(rest);
    let (filter, rest) = word_p(rest);
    let mut splits = filter.split("=");
    
    if let (Some(left), Some(right)) = (splits.next(), splits.next()) {
        (
            Some(EqualityPredicate { 
                property_name: String::from(left),
                value: serde_json::from_str(right).unwrap(),
            }),
            rest
        )
    } else {
        (None, rest)
    }
}

fn word_p(mut input: String) -> (String, String) {
    if let Some(position) = input.chars().position(|c| c.is_whitespace()) {
        println!("{}", position);
        let rest = input.split_off(position);
        (input, consume_leading_whitespace(rest))
    } else {
        (String::from(""), input)
    }
}

fn chars_p(mut input: String, pattern: &str) -> (String, String) {
    if input.to_lowercase().starts_with(&pattern.to_lowercase()) {
        let drain = input.drain(..pattern.len());
        (drain.collect(), input)
    } else { (String::from(""), input) }
}

fn consume_leading_whitespace(mut input: String) -> String {
    let maybe_ix = input.chars().position(|c| !c.is_whitespace());
    if let Some(ix) = maybe_ix {
        input.drain(..ix);
    }
    input    
}

fn consume_chars(input: String, pattern: &str) -> String {
    chars_p(input, pattern).1
}



#[cfg(test)]
mod tests {
    use crate::parser::*;

    #[test]
    fn parse_select_list() {
        let (columns, rest) = select_list_p(String::from("SELECT a,b,c"));
        assert_eq!(vec!["a", "b", "c"], columns);
        assert_eq!("", rest);
        let (columns, rest) = select_list_p(String::from("select a,b,c"));
        assert_eq!(vec!["a", "b", "c"], columns);
        assert_eq!("", rest);
    }

    #[test]
    fn parse_select_list_with_remainder() {
        let (columns, rest) = select_list_p(String::from("SELECT a,b,c\nFROM tableA"));
        assert_eq!(vec!["a", "b", "c"], columns);
        assert_eq!("FROM tableA", rest);
    }

    #[test]
    fn parse_filter() {
        assert_eq!(
            (
                Some(EqualityPredicate {
                    property_name: String::from("a"),
                    value: serde_json::from_str("1").unwrap()
                }), 
                String::from(""),
            ), 
            filter_p(String::from("a=1")));

    }

    #[test]
    fn consume_leading_whitespace_test() {
        assert_eq!("FROM tableA", consume_leading_whitespace(String::from("   \n  FROM tableA")));
    }

    #[test]
    fn consume_chars_test() {
        assert_eq!("a,b,c FROM tableA", consume_chars(String::from("SELECT a,b,c FROM tableA"), "SELECT "));
    }

    #[test]
    fn word_p_test() {
        assert_eq!((String::from("quoka"), String::from("dollar")), word_p(String::from("quoka\n dollar")));
    }

    #[test]
    fn parse_select_list_with_weird_whitespace() {
        let (columns, rest) = select_list_p(String::from("SELECT \n a,b,c \n  FROM tableA"));
        assert_eq!(vec!["a", "b", "c"], columns);
        assert_eq!("FROM tableA", rest);
    }
}