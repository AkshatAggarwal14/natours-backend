// const catchAsync = (fn) => {
//     return (req, res, next) => {
//         fn(req, res, next).catch((err) => next(err));
//     };
// };

//! create an anonymous function!
// execute promise and catch errors -> pass into next
const catchAsync = (fn) => (req, res, next) => {
    fn(req, res, next).catch(next);
};

module.exports = catchAsync;
