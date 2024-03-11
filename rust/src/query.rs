use serde_json::Value;

mod producer;
mod filter;
mod parser;
mod planner;

pub fn evaluate(user_input: &str) -> Box<dyn Itrator> {

    let query = parser::parse(user_input.to_string());

    let plan: planner::Plan = planner::plan(query);

    let p = producer::Producer::new(plan.get(0), vec!["@t".into(), "@mt".into()]);

    Box::new(filter::Filter {
        source: p
    })
}

pub type Row = Vec<Value>;
pub trait Itrator {
    fn next(&mut self) -> Option<Row>;
}