import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { read, listRelated } from "./apiCore";
import Card from "./Card";
import Carousel from 'react-multi-carousel'
import ImageGallery from 'react-image-gallery';
import 'react-multi-carousel/lib/styles.css'
import "react-image-gallery/styles/css/image-gallery.css";


const Product = props => {

    const [product, setProduct] = useState({});
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [error, setError] = useState(false);
    const [images, setImages] = useState([]);
    const responsive = {
        superLargeDesktop: {
            // the naming can be any, depends on you.
            breakpoint: { max: 4000, min: 3000 },
            items: 4,
        },
        desktop: {
            breakpoint: { max: 3000, min: 1025 },
            items: 3,
        },
        tablet: {
            breakpoint: { max: 1024, min: 768 },
            items: 2,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
        },
    };

    



    const loadSingleProduct = productId => {
        read(productId).then((data = []) => {
            if (data && data.error) {
                setError(data.error);
            } else {
                setProduct(data);
                createGallery(data);
                // fetch related products
                listRelated(data._id)
                .then((data = []) => {
                    if(data.error) {
                        setError(data.error);
                    } else {
                        setRelatedProducts(data);
                    }
                })
            }
        });
    };

    const createGallery = (product) => {
        const arr = [];
        if(product){
            const img = product.images
            img.map((images) => {
                if(images.isApproved){
                    arr.push({
                        original: images.url,
                        thumbnail: images.url
                    })
                }
            })

            console.log(arr);
            setImages(arr);
        }
    }

    useEffect(() => {
        // getting params from URL thorugh react-router-dom
        // update when props changes. Like when clicking in a related product
        const productId = props.match.params.productId;

        loadSingleProduct(productId);
    }, [props]);

    return (
        <Layout>

            <div className="product__banner" style={{backgroundImage:`url(${ product.imagePrimary}.png)`}}> </div>
            <div className="container">
                <div className="row">
                    <div className="col-12 mt-5">
                        <div className="card__product-details">
                            {
                                product &&
                                product.description &&
                                <div className="product__details">
                                    <ImageGallery className="product__gallery" items={images} showNav={false} autoPlay={true} showPlayButton={false} showFullscreenButton={false} />
                                    <Card product={product} showViewProductButton={false} divClassProduct="" />
                                </div>
                            }
                        </div>
                    </div>
                    <div className="col-12 products__related">
                        <h4 className="mt-5">Related Products</h4>
                        <br />
                        <Carousel
                            responsive={responsive}
                            draggable={true}
                            infinite
                            containerClass="testimonial--container"
                            arrows={false}
                            autoPlay
                            autoPlaySpeed={3000}
                            dotListClass="testimonial--dots"
                            showDots
                        >
                        {relatedProducts.map((p, ind) => (
                            <div key={ind} className="mb-3 mx-2">
                                <Card product={p} />
                            </div>
                        ))}
                        </Carousel>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default Product;
