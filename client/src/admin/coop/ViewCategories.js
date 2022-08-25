import React, { useEffect, useState } from "react";
import Layout from "../../core/Layout";
import { isAuthenticated } from "../../auth";
import { Link } from 'react-router-dom';
import Jumbotron from './../../core/Jumbotron';
import { getAllCategories, updateCategoryBrands } from '../apiAdmin';
import Modal from 'react-modal';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
    }
};

const ViewCategories = () => {
    const [categories, setCategories] = useState([])
    const [modal, setModal] = useState(false);
    const [category, setCategory] = useState(null);


    const [newBrand, setNewBrand] = useState({
        name: '',
        image: ''
    })

    useEffect(() => {
        getAllCategories().then(data => {
            setCategories(data)
        })
    }, [])

    const { user, token } = isAuthenticated();
    const goBack = () => (
        <div className="mt-5">
            <Link to="/admin/dashboard" className="btn btn-outline-warning">
                Back to Dashboard
            </Link>
        </div>
    );

    const addBrand = (e) => {
        e.preventDefault();
        //add to the brands
        //update the state
        //get the category based on id
        let foundCategoryIndex = categories.findIndex(el => el._id === category)
        let brandsUpdated = [...categories[foundCategoryIndex].brands, { ...newBrand }];
        let data = {
            id: category,
            brands: brandsUpdated
        }
        updateCategoryBrands(data, token).then(() => {
            let foundCategory = categories[foundCategoryIndex];
            let updates = categories.map(cat => {
                return cat._id === category ? {
                    ...cat,
                    brands: [
                        ...foundCategory.brands,
                        {
                            ...newBrand
                        }
                    ]
                } : cat
            })
            setCategories(updates)
            closeAddBrand();
        })


    }

    const onChange = (e) => {
        const { name, value } = e.target;
        setNewBrand({ ...newBrand, [name]: value })

    }

    const addBrandModal = () => {
        return <Modal
            isOpen={modal}
            style={customStyles}
            contentLabel="Example Modal"
        >

            <form onSubmit={addBrand} onChange={onChange}>
                <div className="form-group">
                    <label className="text-muted">Name</label>
                    <input
                        name="name"
                        type="text"
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label className="text-muted">image url</label>
                    <input
                        name="image"
                        type="text"
                        className="form-control"
                    />
                </div>
                <button className="btn btn-primary w-100 mb-2">Add</button>
                <button type='button' onClick={closeAddBrand} className="btn btn-warning w-100"> Close </button>
            </form>
        </Modal>
    }

    const showAddBrand = (category) => {
        alert(category)
        setModal(true);
        setCategory(category)
    }

    const closeAddBrand = () => {
        setModal(false);
    }

    const removeBrand = (url, category) => {
        //find the brand
        let foundCategoryIndex = categories.findIndex(el => el._id === category)
        //remove brand
        let brandIndex = categories[foundCategoryIndex].brands.findIndex(el => el.image === url);
        let brands = categories[foundCategoryIndex].brands
        brands.splice(brandIndex, 1)
        
         let data = {
            id: category,
            brands: brands
        }

        updateCategoryBrands(data, token).then(() => {
            let foundCategory = categories[foundCategoryIndex];
            let updates = categories.map(cat => {
                return cat._id === category ? {
                    ...cat,
                    brands: brands
                } : cat
            })
            setCategories(updates)
            closeAddBrand();
        })
    }

    const showBrands = (brands, category) => {
        return brands.length > 0 ?
            brands.map((brand, key) => {
                return <ul className="list-group-item" key={key}><h4>{brand.name}</h4><br /> <img class='img-fluid' src={brand.image} /> <button onClick = {() => {removeBrand(brand.image, category)}} class='btn btn-warning'> Remove</button></ul>
            }) : <h4> There are no brands </h4>
    }
    return <Layout>
        {addBrandModal()}
        <div className="">
            <Jumbotron title="Categories" description={`Starry day ${user.name}`} />
        </div>
        <div className="container">
            <div className="mb-5">
                {goBack()}
            </div>

            <div className="row">
                <div className="col-10 mr-auto col-md-8">
                    {categories.map((category, key) => {
                        return <div key={key}>
                            <h2 className="mt-5">
                                {category.name}
                            </h2>
                            <button onClick={() => { showAddBrand(category._id) }} className="btn btn-primary mb-2">Add brand</button>
                            <div className="list-group mb-2">
                                {showBrands(category.brands, category._id)}
                            </div>
                        </div>
                    })}
                </div>
            </div>

        </div>
    </Layout>
}

export default ViewCategories;