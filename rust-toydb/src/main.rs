use crate::producer::Itrator;

mod producer;
mod filter;

fn main() {
    let path = "/Users/liammclennan/toydb/data/tablea.clef";
    let mut p = producer::Producer::new(path, vec!["@t".into(), "@mt".into()]);
    let mut f = filter::Filter::new::<producer::Producer>(&mut p);
    
    while let Some(line) = f.next() {
        println!("{:?}", line)
    }
}

