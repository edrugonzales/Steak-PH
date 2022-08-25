import React, {useState} from "react";
import { Paper } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/black-and-white.css";
import "animate.css";
import { updateProductDiscount } from "../data/updateProductDiscount";

const ProductCardItem = ({ product = {} }) => {
  let [data, setData] = useState(product)
  async function updateDiscountOfProduct(product, newProduct){
    let response = await updateProductDiscount(product, newProduct)

    if(response.status === 200){
      let result = await response.json()
      console.log(result)
      setData(newProduct)
      alert('update done')
    }else {
      console.log('something happened')
      let result = await response.json()
      console.log(result)
    }
  }

  function change() {
    let discount = prompt('Change discount here, number or percentage')

    if(!discount)
      return 
    if(discount.includes('%')){
      let amountDiscount = discount.replaceAll('%', '')
      if(isNaN(amountDiscount)){
        return alert('Please enter a number')
      }
      else {
        updateDiscountOfProduct(product, {
          ...product, 
          discount: discount
        })

        return
      }
    }

    if(!isNaN(discount)){
      updateDiscountOfProduct(product, {
        ...product, 
        discount: discount
      })
    }else 
      return alert('Please enter number or percentage')
    console.log(discount)
  }


  return (
    <Paper
      className='animate__animated animate__fadeInDown'
      sx={{
        position: "relative",
        width: "10.5em",
        margin: "9px",
        maxWidth: "60%",
        transition: "0.3s",
      }} 
      onClick = {change}
      >
      <div
        style={{
          position: "absolute",
          top: "2%",
          right: "2%",
          borderRadius: "100%",
          height: "10px",
          width: "10px",
          backgroundColor: data.isApproved ? "green" : "red",
          zIndex: "1",
        }}></div>
        <LazyLoadImage
          src={data.images[0].url}
          alt='product-image'
          width='100%'
          height='160px'
          effect={"black-and-white"}
          style={{
            borderTopLeftRadius: "0.2em",
            borderTopRightRadius: "0.2em",
            objectFit: "cover",
          }}
        />
      <div
        style={{
          margin: "0.2em",
          display: "flex",
          justifyContent: "space-between",
        }}>
        <div
          style={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            maxWidth: "150px",
            fontSize: "1em",
            fontWeight: "bold",
          }}>
						{data.name}
        </div>
        <div>
          {product.status ? (
            <Visibility fontSize={"10px"} />
          ) : (
            <VisibilityOff fontSize={"10px"} />
          )}
        </div>
      </div>
      <div style = {{
        margin: '0.2em', 
        display: 'flex', 
        justifyContent: 'space-between'
      }}>
        Discount: {data?.discount ? data.discount : 0}
      </div>
    </Paper>
  );
};

export default ProductCardItem;
