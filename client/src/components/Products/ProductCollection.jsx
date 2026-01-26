import { useEffect } from "react"
import { useProduct } from "../../context/ProductContext"
import ProductGrid from "./ProductGrid"
import { useNavigate } from "react-router-dom"

const ProductCollection = ({ type }) => {
  const { getCollectionType, products } = useProduct()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProducts = async () => {
      await getCollectionType(type)
    }
    fetchProducts()
  }, [type])

  const handleProductClick = (id) => {
    navigate(`/product/${id}`)
  }

  return (
    <div>
      <ProductGrid listProducts={products} onProductClick={handleProductClick} />
    </div>
  )
}

export default ProductCollection
