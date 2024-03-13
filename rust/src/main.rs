use std::io::{self, BufRead};

mod query;

fn main() {  
    let stdin = io::stdin();
    for line in stdin.lock().lines() {
        let line = line.unwrap();
        let mut itr = query::evaluate(&line);
        while let Some(line) = itr.next() {
            println!("{:?}", line)
        }
    }
}

