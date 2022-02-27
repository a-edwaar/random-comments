"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var e = React.createElement;

var Upvote = function Upvote(_ref) {
  var id = _ref.id,
      commentUpvotes = _ref.commentUpvotes;

  var _React$useState = React.useState(commentUpvotes),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      upvotes = _React$useState2[0],
      setUpvotes = _React$useState2[1];

  var _React$useState3 = React.useState(false),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      upvoted = _React$useState4[0],
      setUpvoted = _React$useState4[1];

  React.useEffect(function () {
    document.body.addEventListener("comment-" + id, function (_ref2) {
      var detail = _ref2.detail;
      var newUpvotes = detail.upvotes;

      setUpvotes(parseInt(newUpvotes, 10));
    });
  }, []);

  var onFormSubmit = function onFormSubmit(e) {
    e.preventDefault();
    fetch("/api/comments/" + id, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        upvoted: upvoted
      })
    }).then(function (response) {
      if (response.status !== 200) {
        throw Error("Bad response from server");
      }
      return response.json();
    }).then(function (data) {
      var newUpvotes = data.upvotes;

      setUpvotes(newUpvotes);
      setUpvoted(!upvoted);
    }).catch(function (e) {
      console.error(e);
      document.querySelector("#error-message").classList.remove("hidden");
    });
  };

  return React.createElement(
    "form",
    { onSubmit: onFormSubmit },
    React.createElement(
      "button",
      {
        type: "submit",
        className: "flex items-center " + (upvoted ? "text-indigo-600 hover:text-indigo-900" : "hover:text-black")
      },
      React.createElement(
        "span",
        { className: (upvoted ? "hidden" : "block") + " text-[8px]" },
        "\u25B2"
      ),
      React.createElement(
        "span",
        { className: (upvoted ? "block" : "hidden") + " text-[8px]" },
        "\u25BC"
      ),
      React.createElement(
        "span",
        { className: "upvotes ml-2" },
        upvotes
      ),
      React.createElement(
        "span",
        { className: "ml-1" },
        "Upvotes"
      )
    )
  );
};

document.querySelector("#comments").addEventListener("renderedComments", function (_event) {
  document.querySelectorAll(".upvotes-container").forEach(function (domContainer) {
    ReactDOM.render(e(Upvote, {
      id: domContainer.dataset.commentid,
      commentUpvotes: parseInt(domContainer.dataset.commentupvotes, 10)
    }), domContainer);
  });
});