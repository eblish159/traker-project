export async function fetchCategories() {

  const res = await fetch("/api/categories", {
    method: "GET",
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("카테고리 조회 실패");
  }

  return res.json();
}