use crate::producer::{Itrator, Row};

pub(crate) struct Filter {
    pub source: Box<dyn Itrator>,
}

impl Itrator for Filter {
    fn next(&mut self) -> Option<Row> {
        self.source.next()
    }
}