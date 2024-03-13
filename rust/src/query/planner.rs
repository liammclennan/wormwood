use serde_json::Value;

use crate::query::parser::Query;

pub struct Plan {
    pub producer: ProducerStep,
    pub filter: Option<FilterStep>,
}

pub struct ProducerStep {
    pub source: String,
    pub columns: Vec<String>,
}

pub struct FilterStep {
    pub columns: Vec<String>,
    pub property_name: String,
    pub value: Value,
}

pub fn plan(query: Query) -> Plan {
    Plan {
        producer: ProducerStep {
            source: query.source,
            columns: query.columns.clone(),
        },
        filter: query.filter.map(|predicate| FilterStep {
            columns: query.columns,
            property_name: predicate.property_name,
            value: predicate.value,
        })
    }
}
