use crate::query::{Itrator, Row};
use crate::query::planner::FilterStep;
use crate::query::producer::Producer;

pub(crate) struct Filter {
    pub source: Producer,
    pub plan: FilterStep,
}

impl Itrator for Filter {
    fn next(&mut self) -> Option<Row> {
        self.source.next()
    }
}