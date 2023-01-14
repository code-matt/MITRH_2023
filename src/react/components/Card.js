import React from 'react'
import './Card.scss'

const Card = (props) => {
    return <div
        className='card'
        style={{
            backgroundImage: `url('${[props.image]}')`
        }}
    >

    </div>
}

export default Card