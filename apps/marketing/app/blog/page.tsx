import StubPage from "../../components/StubPage";
import { blogIndex, placeholderPost } from "../../content/blog";

export default function BlogPage() {
  return (
    <>
      <StubPage content={blogIndex} />
      <div className="stub-page stub-page-tight">
        <article className="stub-note">
          <p className="eyebrow">{placeholderPost.date}</p>
          <h2 className="stub-post-title">{placeholderPost.title}</h2>
          <p>{placeholderPost.excerpt}</p>
        </article>
      </div>
    </>
  );
}
