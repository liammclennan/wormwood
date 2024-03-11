use crate::query::{Itrator, Row};
use crate::query::producer::Producer;

pub(crate) struct Filter {
    pub source: Producer,
}

impl Itrator for Filter {
    fn next(&mut self) -> Option<Row> {
        self.source.next()
    }
}