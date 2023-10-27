use std::io;
use std::fs::File;
use std::io::{BufRead, BufReader, Lines};
use std::iter::Iterator;
use serde_json::{Result, Value};
use crate::producer::Itrator;


mod producer;


fn main() {
    let path = "/Users/liammclennan/toydb/data/tablea.clef";
    let mut p = producer::Producer::new(path, vec!["@t".into(), "@mt".into()]);

    while let Some(line) = p.next() {
        println!("{:?}", line)
    }
}

