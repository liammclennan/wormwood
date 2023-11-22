use crate::producer::{Itrator, Row};

pub(crate) struct Filter<'a> {
    source: &'a mut dyn Itrator,
}

impl<'a> Filter<'a> {
    pub(crate) fn new<T: Itrator>(source: &'a mut impl Itrator) -> Filter {
        Filter {
            source
        }
    }
}

impl<'a> Itrator for Filter<'a> {
    fn next(&mut self) -> Option<Row> {
        self.source.next()
    }
}