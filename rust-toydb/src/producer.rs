use std::fs::File;
use std::io::{BufRead, BufReader, Lines};
use serde_json::Value;

pub type Row = Vec<Value>;
pub trait Itrator {
    fn next(&mut self) -> Option<Row>;
}

pub(crate) struct Producer {
    iterator: Lines<BufReader<File>>,
    cols: Vec<String>,
}

impl Producer {
    pub fn new(path: &str, cols: Vec<String>) -> Producer {
        let file = File::open(path).unwrap();
        Producer {
            iterator: BufReader::new(file).lines(),
            cols
        }
    }
}

impl Itrator for Producer {
    fn next(&mut self) -> Option<Row> {
        self.iterator.next()
            .map(|sr| sr.unwrap())
            .and_then(|s| serde_json::from_str(&s).ok())
            .and_then(|o| match o {
                Value::Object(mut map) => {
                    let a:Vec<Value> = self.cols.iter().flat_map(|col| {
                        map.remove(col)
                    }).collect();
                    Some(a)
                },
                _ => None,
            })
    }
}