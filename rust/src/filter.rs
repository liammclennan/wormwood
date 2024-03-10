use crate::producer::{Itrator, Row};

pub(crate) struct Filter {
    pub source: crate::producer::Producer,
}

impl Itrator for Filter {
    fn next(&mut self) -> Option<Row> {
        self.source.next()
    }
}