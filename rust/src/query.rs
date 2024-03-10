use crate::producer::Itrator;
use crate::producer;
use crate::filter;


pub fn evaluate(_user_input: &str) -> Box<dyn Itrator> {
    let path = "/Users/liammclennan/wormwood/data/tablea.clef";
    let p = producer::Producer::new(path, vec!["@t".into(), "@mt".into()]);

    Box::new(filter::Filter {
        source: p
    })
}