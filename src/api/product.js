import api from "./axios";

export const getProducts = async (
  limit,
  skip,
  category,
  sort,
  signal
) => {
  let url = "/products";

  if (category) {
    url = `/products/category/${category}`;
  }

  const params = {
    limit,
    skip,
  };

  if (sort) {
    const [sortBy, order] = sort.split("-");

    params.sortBy = sortBy;
    params.order = order;
  }

  const response = await api.get(url, {
    params,
    signal,
  });

  return response.data;
};

export const searchProducts = async (
  query,
  limit,
  skip,
  sort,
  signal
) => {
  const params = {
    q: query,
    limit,
    skip,
  };

  if (sort) {
    const [sortBy, order] = sort.split("-");

    params.sortBy = sortBy;
    params.order = order;
  }

  const response = await api.get("/products/search", {
    params,
    signal,
  });

  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/products/categories");

  return response.data;
};

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);

  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);

  return response.data;
};

export const addProduct = async (product) => {
  const response = await api.post("/products/add", product);

  return response.data;
};

export const updateProduct = async (id, product) => {
  const response = await api.put(`/products/${id}`, product);

  return response.data;
};