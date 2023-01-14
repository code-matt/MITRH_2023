import React from 'react'
import Card from '../components/Card'

import './Home.scss'

import home1img from '../../assets/images/home1.png'
import home2img from '../../assets/images/home2.png'
import home3img from '../../assets/images/home3.png'
const HomeScreen = (props) => {

    let { launchAppFxn } = props

    return <div className='homescreen'>
        <div className='banner-container'>
            <h1>SOULSYNC</h1>
        </div>
        <div className='top-container'>
            <Card image={home1img} />
            <Card image={home2img} />
            <Card image={home3img} />
        </div>
        <div className='bottom-container'>
            <div className='button' onClick={launchAppFxn}>
                LAUNCH
            </div>
        </div>
    </div>
}

export default HomeScreen