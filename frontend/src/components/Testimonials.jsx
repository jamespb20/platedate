import React from "react";
import Carousel from "react-bootstrap/Carousel";

const testimonials = require("../testimonials.json");

function Testimonials() {
    return (
        <div className="testimonials-section container my-5 w-100 mx-auto">
            <h2 className="text-center mb-4">What Our Users Say</h2>
            <Carousel>
                {testimonials.map((testimonial, index) => (
                    <Carousel.Item key={index} interval={15000}>
                        <div className="row align-items-center">
                            <div className="col-md-4">
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="d-block w-100 rounded-circle"
                                />
                            </div>
                            <div className="col-md-8">
                                <h3>{testimonial.name}</h3>
                                <p className="testimonial">{testimonial.text}</p>
                            </div>
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel>
        </div>
    );
}

export default Testimonials;
