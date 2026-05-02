export default function ShopPage({ params }: { params: { slug: string } }) {
  return <div>Loja: {params.slug}</div>
}
