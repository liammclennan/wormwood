use crate::query::{Itrator, Row};
use crate::query::planner::FilterStep;
use crate::query::producer::Producer;

pub(crate) struct Filter {
    pub source: Producer,
    pub plan: FilterStep,
}

impl Itrator for Filter {
    fn next(&mut self) -> Option<Row> {
        let mut next = self.source.next();

        let col_ix = self.plan.columns.iter().position(|c| c == &self.plan.property_name).unwrap();

        while let Some(row) = next {
            // find index of column
            //plan.columns
            if row.get(col_ix).unwrap() == &self.plan.value {
                return Some(row);
            }

            next = self.source.next();
        }
        next
    }
}