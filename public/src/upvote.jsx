"use strict";

const e = React.createElement;

const Upvote = ({ id, commentUpvotes }) => {
  const [upvotes, setUpvotes] = React.useState(commentUpvotes);
  const [upvoted, setUpvoted] = React.useState(false);

  const onFormSubmit = (e) => {
    e.preventDefault();
    fetch(`/api/comments/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        upvoted,
      }),
    })
      .then((response) => {
        if (response.status !== 200) {
          throw Error("Bad response from server");
        }
        return response.json();
      })
      .then((data) => {
        const { upvotes: newUpvotes } = data;
        setUpvotes(newUpvotes);
        setUpvoted(!upvoted);
      })
      .catch((_e) => {
        document.querySelector("#error-message").classList.remove("hidden");
      });
  };

  return (
    <form onSubmit={onFormSubmit}>
      <button
        type="submit"
        className={`flex items-center ${
          upvoted ? "text-indigo-600 hover:text-indigo-900" : "hover:text-black"
        }`}
      >
        <span className={`${upvoted ? "hidden" : "block"} text-[8px]`}>▲</span>
        <span className={`${upvoted ? "block" : "hidden"} text-[8px]`}>▼</span>
        <span className="upvotes ml-2">{upvotes}</span>
        <span className="ml-1">Upvotes</span>
      </button>
    </form>
  );
};

document
  .querySelector("#comments")
  .addEventListener("renderedComments", (_event) => {
    document.querySelectorAll(".upvotes-container").forEach((domContainer) => {
      ReactDOM.render(
        e(Upvote, {
          id: domContainer.dataset.commentid,
          commentUpvotes: parseInt(domContainer.dataset.commentupvotes, 10),
        }),
        domContainer
      );
    });
  });
