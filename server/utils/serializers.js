export const serializeBlog = (blog) => {
  if (!blog) {
    return null;
  }

  const { id, ...rest } = blog;

  return {
    _id: id,
    id,
    ...rest,
    subtitle: blog.subTitle,
  };
};

export const serializeComment = (comment) => {
  if (!comment) {
    return null;
  }

  const { id, blogId, blog, ...rest } = comment;

  return {
    _id: id,
    id,
    blogId,
    ...rest,
    blog: blog ? serializeBlog(blog) : undefined,
  };
};
