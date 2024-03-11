use serde_json::Value;

use crate::query::parser::Query;

pub type Plan = Vec<Step>;

pub enum Step {
    Producer(ProducerStep),
    Filter(FilterStep),
}

pub struct ProducerStep {
    pub source: String,
    pub columns: Vec<String>,
}

pub struct FilterStep {
    columns: Vec<String>,
    property_name: String,
    value: Value,
}

pub fn plan(query: Query) -> Plan {
    let mut plan: Plan = vec![];

    plan.push(Step::Producer(ProducerStep {
        source: query.source,
        columns: query.columns.clone(),
    }));

    if let Some(filter) = query.filter {
        plan.push(Step::Filter(FilterStep {
            columns: query.columns,
            property_name: filter.property_name,
            value: filter.value,
        }));
    }

    plan
}
