import React from 'react'

import './Home.scss'

import logo from '../../assets/images/logo.png'
const HomeScreen = (props) => {

    let { launchAppFxn } = props

    return <div className='homescreen'>
        <div className='banner-container'>
            <img src={logo}></img>
            <h1>Soulsync</h1>
        </div>
        <div className='top-container'>
            <h2>Sync to Give</h2>
            <div>
            <p>Soulsync is a decentralized autonomous charity platform. Featuring collaborative presence synchronization activities to earn and donate Solana tokens. Soulsync makes every effort to provide a transparent charity process enabled by blockchain - free from doubts of corruption, full with gratitude and trust.</p>
            </div>
        </div>
        <div className='bottom-container'>
            <div className='button' onClick={launchAppFxn}>
                Launch
            </div>
        </div>
    </div>
}

export default HomeScreen