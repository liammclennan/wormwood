use std::fs::File;
use std::io::{BufRead, BufReader, Lines};
use serde_json::Value;
use crate::query::{Row,Itrator};
use super::planner::ProducerStep;

pub(crate) struct Producer {
    step: ProducerStep,
    iterator: Lines<BufReader<File>>,
}

impl Producer {
    pub fn new(step: ProducerStep) -> Producer {
        let path = format!("../data/{}.clef", step.source);
        let file = File::open(path).unwrap();

        Producer {
            step,
            iterator: BufReader::new(file).lines(),
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
                    let a:Vec<Value> = self.step.columns.iter().flat_map(|col| {
                        map.remove(col)
                    }).collect();
                    Some(a)
                },
                _ => None,
            })
    }
}