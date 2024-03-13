use crate::query::planner::Plan;
use crate::query::filter::Filter;
use crate::query::Itrator;
use super::producer::Producer;

pub fn run(plan: Plan) -> Box<dyn Itrator> {
    let producer = Producer::new(plan.producer);

    if let Some(filter_step) = plan.filter {
        Box::new(Filter {
            source: producer,
            plan: filter_step,
        })
    } else {
        Box::new(producer)
    }
}