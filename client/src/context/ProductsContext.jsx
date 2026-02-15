// Dependencies
import React, { createContext, useState, useContext } from "react";
// API unificado
import * as ProductsAPI from "../api/products";

// Context
export const ProductsContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context)
    throw new Error("useProducts must be used within a ProductsProvider");
  return context;
};

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [audits, setAudits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [kardexG, setKardexG] = useState([]);
  const [kardexDep, setKardexDep] = useState([]);
  const [errors, setErrors] = useState([]);
  const [productDeposits, setProductDeposits] = useState([]);
  const [productKardexG, setProductKardexG] = useState([]);

  // -------------------- PRODUCTOS --------------------
  const getAllProducts = async () => {
    try {
      const res = await ProductsAPI.getAllProducts();
      console.log(res);
      setProducts(res.data?.data || []);
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error fetching products"],
      ]);
    }
  };

  const getProductsById = async (id) => {
    try {
      const res = await ProductsAPI.getProductById(id);
      const product = res.data?.data;

      if (!product) return null;

      setProducts((prevProducts) => {
        const exists = prevProducts.find(p => p.id === id);

        if (exists) {
          // Actualiza el existente
          return prevProducts.map(p =>
            p.id === id ? product : p
          );
        } else {
          // Lo agrega si no existe
          return [...prevProducts, product];
        }
      });

      return product;
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error fetching product by id"],
      ]);
      return null;
    }
  };

  
  const createNewProduct = async (newProduct) => {
    try {
      const res = await ProductsAPI.createProduct(newProduct);
      console.log(res.data.data)
      setProducts((prev) => [...prev, res.data.data]);
      return { status: true, data: res.data };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error creating product"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };
  
  const editProduct = async (id, product) => {
    try {
      const res = await ProductsAPI.updateProduct(id, product);
      const updated = res.data.data;
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return { status: true, data: updated };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error editing product"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };
  
  const deleteProductById = async (id) => {
    try {
      const res = await ProductsAPI.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { status: true };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error deleting product"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };
  
  // -------------------- PRODUCTOS --------------------
  
    const getAuditProd = async (id_producto) => {
    try {
      setAudits([])
      const res = await ProductsAPI.getProductAudById(id_producto);
      console.log(res.data.data);
      setAudits(res.data?.data || []);
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error fetching lotes"],
      ]);
    }
  };

  // -------------------- CATEGORIAS --------------------
  const getAllCategories = async () => {
    try {
      const res = await ProductsAPI.getAllCategories();
      setCategories(res.data?.data || []);
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error fetching categories"],
      ]);
    }
  };
  
  const createNewCategory = async (newCategory) => {
    try {
      const res = await ProductsAPI.createCategory(newCategory);
      setCategories((prev) => [...prev, res.data]);
      return { status: true, data: res.data };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error creating category"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editCategory = async (id, category) => {
    try {
      const res = await ProductsAPI.updateCategory(id, category);
      const updated = res.data;
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return { status: true, data: updated };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error editing category"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deleteCategoryById = async (id) => {
    try {
      await ProductsAPI.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return { status: true };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error deleting category"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  // -------------------- MARCAS --------------------
  const getAllBrands = async () => {
    try {
      const res = await ProductsAPI.getAllBrands();
      setBrands(res.data?.data || []);
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error fetching brands"],
      ]);
    }
  };

  const createNewBrand = async (newBrand) => {
    try {
      const res = await ProductsAPI.createBrand(newBrand);
      setBrands((prev) => [...prev, res.data]);
      return { status: true, data: res.data };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error creating brand"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editBrand = async (id, brand) => {
    try {
      const res = await ProductsAPI.updateBrand(id, brand);
      const updated = res.data;
      setBrands((prev) => prev.map((b) => (b.id === id ? updated : b)));
      return { status: true, data: updated };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error editing brand"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deleteBrandById = async (id) => {
    try {
      await ProductsAPI.deleteBrand(id);
      setBrands((prev) => prev.filter((b) => b.id !== id));
      return { status: true };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error deleting brand"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  // -------------------- LOTES --------------------
  const getAllLotes = async () => {
    try {
      const res = await ProductsAPI.getAllLotes();
      console.log(res.data.data);
      setLotes(res.data?.data || []);
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error fetching lotes"],
      ]);
    }
  };

  const getAllLotesByProd = async (id_producto) => {
    try {
      const res = await ProductsAPI.getAllLotesProd(id_producto);
      console.log(res.data.data);
      setLotes(res.data?.data || []);
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error fetching lotes"],
      ]);
    }
  };

  const createNewLote = async (newLote) => {
    try {
      const res = await ProductsAPI.createLote(newLote);
      setLotes((prev) => [...prev, res.data]);
      return { status: true, data: res.data };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error creating lote"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editLote = async (id, lote) => {
    try {
      const res = await ProductsAPI.updateLote(id, lote);
      const updated = res.data;
      setLotes((prev) => prev.map((l) => (l.id === id ? updated : l)));
      return { status: true, data: updated };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error editing lote"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deleteLoteById = async (id) => {
    try {
      await ProductsAPI.deleteLote(id);
      setLotes((prev) => prev.filter((l) => l.id !== id));
      return { status: true };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error deleting lote"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  // -------------------- EXISTENCIAS POR DEPOSITO --------------------
  const getEDepositsByProduct = async (id_producto) => {
    try {
      const res = await ProductsAPI.getProductEdeposit(id_producto);
      // backend devuelve { data: { ..., depositos: [] } }
      setProductDeposits(res.data?.data || []);
      return { status: true };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error fetching deposits by product"],
      ]);
      return { status: false };
    }
  };

  const createEDepositByProduct = async (id_producto, newDeposit) => {
    try {
      const res = await ProductsAPI.createProductEdeposit(
        id_producto,
        newDeposit,
      );
      setProductDeposits((prev) => [...prev, res.data.data]);
      return { status: true, data: res.data.data };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error creating deposit existence"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editEDepositByProduct = async (id_edeposito, data) => {
    try {
      console.log({id_edeposito, data})
      
      const res = await ProductsAPI.updateProductEdeposit(id_edeposito, data);
      const updated = res.data.data;
      setProductDeposits((prev) =>
        prev.map((d) => (d.id === id_edeposito ? updated : d)),
      );
      return { status: true, data: updated };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error editing deposit existence"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deleteEDepositByProduct = async (id_edeposito) => {
    try {
      await ProductsAPI.deleteProductEdeposit(id_edeposito);
      setProductDeposits((prev) => prev.filter((d) => d.id !== id_edeposito));
      return { status: true };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error deleting deposit existence"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  // -------------------- INVENTARIO --------------------
  const getInventoryByProduct = async (id) => {
    try {
      const res = await ProductsAPI.getAllInventory(id);
      setInventory(res.data?.data || []);
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error fetching inventory"],
      ]);
    }
  };

  const createNewInventory = async (newInv) => {
    try {
      console.log(newInv)
      const res = await ProductsAPI.createInventory(newInv);
      setInventory((prev) => [...prev, res.data]);
      return { status: true, data: res.data };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error creating inventory"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editInventory = async (id, inv) => {
    try {
      const res = await ProductsAPI.updateInventory(id, inv);
      const updated = res.data;
      setInventory((prev) => prev.map((i) => (i.id === id ? updated : i)));
      return { status: true, data: updated };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error editing inventory"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deleteInventoryById = async (id) => {
    try {
      await ProductsAPI.deleteInventory(id);
      setInventory((prev) => prev.filter((i) => i.id !== id));
      return { status: true };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error deleting inventory"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  // -------------------- DEPOSITOS --------------------
  const getAllDeposits = async () => {
    try {
      const res = await ProductsAPI.getAllDeposits();
      console.log(res.data.data)
      setDeposits(res.data?.data || []);
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error fetching deposits"],
      ]);
    }
  };

  const createNewDeposit = async (newDep) => {
    try {
      const res = await ProductsAPI.createDeposit(newDep);
      setDeposits((prev) => [...prev, res.data]);
      return { status: true, data: res.data };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error creating deposit"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const editDeposit = async (id, dep) => {
    try {
      const res = await ProductsAPI.updateDeposit(id, dep);
      const updated = res.data;
      setDeposits((prev) => prev.map((d) => (d.id === id ? updated : d)));
      return { status: true, data: updated };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error editing deposit"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  const deleteDepositById = async (id) => {
    try {
      await ProductsAPI.deleteDeposit(id);
      setDeposits((prev) => prev.filter((d) => d.id !== id));
      return { status: true };
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error deleting deposit"],
      ]);
      return { status: false, error: error.response?.data || error.message };
    }
  };

  // -------------------- KARDEX GENERAL --------------------
  const getKardexGByProd = async (id_producto) => {
    try {
      const res = await ProductsAPI.getAllKardexG(id_producto);
      setProductKardexG(res.data?.data || []);
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error fetching kardex general"],
      ]);
    }
  };

  // -------------------- KARDEX DEPOSITO --------------------
  const getAllKardexDep = async (id_producto, id_deposito) => {
    try {
      const res = await ProductsAPI.getAllKardexDep(id_producto, id_deposito);
      setKardexDep(res.data?.data || []);
    } catch (error) {
      setErrors((prev) => [
        ...prev,
        error.response?.data || ["Error fetching kardex deposito"],
      ]);
    }
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        audits,
        categories,
        brands,
        lotes,
        inventory,
        deposits,
        productDeposits,
        productKardexG,
        kardexDep,
        errors,

        getAllProducts,
        getProductsById,
        createNewProduct,
        editProduct,
        deleteProductById,

        getAuditProd,
        
        getAllCategories,
        createNewCategory,
        editCategory,
        deleteCategoryById,

        getAllBrands,
        createNewBrand,
        editBrand,
        deleteBrandById,

        getAllLotes,
        getAllLotesByProd,
        createNewLote,
        editLote,
        deleteLoteById,

        getEDepositsByProduct,
        createEDepositByProduct,
        editEDepositByProduct,
        deleteEDepositByProduct,

        getInventoryByProduct,
        createNewInventory,
        editInventory,
        deleteInventoryById,

        getAllDeposits,
        createNewDeposit,
        editDeposit,
        deleteDepositById,

        getKardexGByProd,
        getAllKardexDep
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};
