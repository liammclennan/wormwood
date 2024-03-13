use serde_json::Value;

mod producer;
mod filter;
mod parser;
mod planner;
mod executor;

pub fn evaluate(user_input: &str) -> Box<dyn Itrator> {
    let query = parser::parse(user_input.to_string());
    let plan: planner::Plan = planner::plan(query);
    executor::run(plan)
}

pub type Row = Vec<Value>;
pub trait Itrator {
    fn next(&mut self) -> Option<Row>;
}