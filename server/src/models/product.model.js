// Dependencies
import pool from "../connection/db.connect.js"

export class Products {

  /* ===========================
     GET ALL PRODUCTS
  =========================== */
  static async products() {
    const msg = {
      status: false,
      msg: "Products not found",
      code: 404
    }

    let connection

    try {
      connection = await pool.connect()

      const sql = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.category,
          p.sku,
          p.price,
          p.cost,
          p.discount,
          p.stock,
          p.min_stock,
          p.status,
          p.favorite,
          p.created_at,
          p.files,
          COALESCE(
            json_agg(
              json_build_object(
                'id', pi.id,
                'data', encode(pi.data, 'base64'),
                'mime_type', pi.mime_type,
                'is_main', pi.is_main,
                'name_file', pi.name_file
              )
            ) FILTER (WHERE pi.id IS NOT NULL), '[]'
          ) AS images
        FROM products p
        LEFT JOIN product_images pi ON pi.product_id = p.id
        GROUP BY p.id;
      `

      const product = await connection.query(sql)
      let result = product.rows

      // 🔹 Reordenar imágenes según JSON files
      result = result.map(p => {
        const filesJson = p.files || []
        let orderedImages = []

        if (filesJson.length > 0) {
          orderedImages = filesJson.map(fj => {
            const match = p.images.find(img => img.id === fj.id)
            return {
              ...fj,
              ...(match || {})
            }
          })
        } else {
          orderedImages = p.images
        }

        return {
          ...p,
          images: orderedImages
        }
      })

      if (result.length > 0) {
        return {
          status: true,
          msg: "Products found",
          code: 200,
          products: result
        }
      }

      return msg
    } catch (error) {
      return {
        status: false,
        msg: "Error fetching products",
        code: 500,
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  /* ===========================
     GET SINGLE PRODUCT
  =========================== */
  static async product(id) {
    let connection

    try {
      connection = await pool.connect()

      const sql = `
        SELECT id, name, description, category, sku,
               price, cost, discount, stock,
               min_stock, status, favorite,
               files, created_at
        FROM products
        WHERE id = $1
      `
      const product = await connection.query(sql, [id])

      if (product.rows.length > 0) {
        return {
          status: true,
          msg: "Product found",
          code: 200,
          data: product.rows
        }
      }

      return {
        status: false,
        msg: "Product not found",
        code: 404
      }
    } catch (error) {
      return {
        status: false,
        msg: "Error fetching product",
        code: 500,
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  /* ===========================
     CREATE PRODUCT
  =========================== */
  static async createProduct(data) {
    let connection

    try {
      connection = await pool.connect()

      const { name, sku } = data

      const verify = await connection.query(
        `SELECT id FROM products WHERE name = $1 OR sku = $2`,
        [name, sku]
      )

      if (verify.rows.length > 0) {
        return {
          status: false,
          msg: "This product already exists",
          code: 409
        }
      }

      const keys = Object.keys(data)
      const values = Object.values(data)
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ")

      const sqlInsert = `
        INSERT INTO products (${keys.join(", ")})
        VALUES (${placeholders})
        RETURNING *
      `

      const insert = await connection.query(sqlInsert, values)

      return {
        status: true,
        msg: "Product registered successfully",
        code: 201,
        data: insert.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        msg: "Error creating product",
        code: 500,
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  /* ===========================
     EDIT PRODUCT
  =========================== */
  static async editProduct(id, data) {
    let connection

    try {
      connection = await pool.connect()

      const verify = await connection.query(
        `SELECT id FROM products WHERE id = $1`,
        [id]
      )

      if (verify.rows.length === 0) {
        return {
          status: false,
          msg: "Product not found",
          code: 404
        }
      }

      const sqlUpdate = `
        UPDATE products
        SET name = $1,
            description = $2,
            category = $3,
            sku = $4,
            price = $5,
            cost = $6,
            discount = $7,
            stock = $8,
            min_stock = $9,
            status = $10,
            favorite = $11
        WHERE id = $12
        RETURNING *
      `

      const values = [
        data.name,
        data.description,
        data.category,
        data.sku,
        data.price,
        data.cost,
        data.discount,
        data.stock,
        data.min_stock,
        data.status,
        data.favorite,
        id
      ]

      const result = await connection.query(sqlUpdate, values)

      return {
        status: true,
        msg: "Product updated successfully",
        code: 200,
        data: result.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        msg: "Error updating product",
        code: 500,
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  /* ===========================
     HIGHLIGHT / FAVORITE
  =========================== */
  static async highlightProduct(id) {
    let connection

    try {
      connection = await pool.connect()

      const verify = await connection.query(
        `SELECT favorite FROM products WHERE id = $1`,
        [id]
      )

      if (verify.rows.length === 0) {
        return {
          status: false,
          msg: "Product not found",
          code: 404
        }
      }

      const newFavorite = !verify.rows[0].favorite

      const result = await connection.query(
        `UPDATE products SET favorite = $1 WHERE id = $2 RETURNING *`,
        [newFavorite, id]
      )

      return {
        status: true,
        msg: `Product ${newFavorite ? "highlighted" : "unhighlighted"} successfully`,
        code: 200,
        data: result.rows[0]
      }

    } catch (error) {
      return {
        status: false,
        msg: "Error updating favorite",
        code: 500,
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  /* ===========================
     DELETE PRODUCT
  =========================== */
  static async deleteProduct(id) {
    let connection

    try {
      connection = await pool.connect()

      const verify = await connection.query(
        `SELECT id FROM products WHERE id = $1`,
        [id]
      )

      if (verify.rows.length === 0) {
        return {
          status: false,
          msg: "Product not found",
          code: 404
        }
      }

      await connection.query(
        `DELETE FROM products WHERE id = $1`,
        [id]
      )

      return {
        status: true,
        msg: "Product deleted successfully",
        code: 200
      }

    } catch (error) {
      return {
        status: false,
        msg: "Error deleting product",
        code: 500,
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  /* ===========================
     FILES
  =========================== */
  static async saveImages(id_product, files) {
    let connection
    try {
      connection = await pool.connect()
      const savedImages = []

      for (let i = 0; i < files.length; i++) {
        const f = files[i]

        const sqlInsert = `
          INSERT INTO product_images
          (product_id, name_file, data, mime_type, is_main)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, name_file, is_main
        `

        const result = await connection.query(sqlInsert, [
          id_product,
          f.originalname,
          f.buffer,
          f.mimetype,
          i === 0
        ])

        savedImages.push(result.rows[0])
      }

      return {
        status: true,
        msg: "Images saved successfully",
        code: 201,
        data: savedImages
      }

    } catch (error) {
      return {
        status: false,
        msg: "Error saving images",
        code: 500,
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async orderFiles(id_product, filesJson) {
    let connection
    try {
      connection = await pool.connect()

      await connection.query(
        `UPDATE products SET files = $1 WHERE id = $2`,
        [JSON.stringify(filesJson), id_product]
      )

      const portada = filesJson.find(f => f.order === 1)

      if (portada?.id) {
        await connection.query(
          `UPDATE product_images SET is_main = false WHERE product_id = $1`,
          [id_product]
        )

        await connection.query(
          `UPDATE product_images SET is_main = true WHERE id = $1`,
          [portada.id]
        )
      }

      return {
        status: true,
        msg: "File order saved successfully",
        code: 201
      }

    } catch (error) {
      return {
        status: false,
        msg: "Error saving file order",
        code: 500,
        error: error.message
      }
    } finally {
      if (connection) connection.release()
    }
  }

  static async deleteImagesByIds(ids) {
    let connection
    try {
      connection = await pool.connect()
      await connection.query(
        `DELETE FROM product_images WHERE id = ANY($1::int[])`,
        [ids]
      )
      return { status: true }
    } catch (error) {
      return { status: false, error: error.message }
    } finally {
      if (connection) connection.release()
    }
  }
}
