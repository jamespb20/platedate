import { useState } from "react";
import { Button, Collapse } from "react-bootstrap";
import faqData from "../faq.json";

function FAQPage() {
    const [faqs] = useState(faqData);
    const [open, setOpen] = useState(Array(faqs.length).fill(false));

    const handleClick = index => {
        setOpen(open.map((val, i) => (i === index ? !val : false)));
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{ minHeight: "100vh" }}
        >
            <div className="mt-5 col-6">
                <h1 className="text-center">FAQ</h1>
                {faqs.map((faq, index) => (
                    <div key={index} className="mt-2">
                        <Button
                            onClick={() => handleClick(index)}
                            aria-controls={`example-collapse-text-${index}`}
                            aria-expanded={open[index]}
                            className="w-100"
                        >
                            {faq.question}
                        </Button>
                        <Collapse in={open[index]}>
                            <div id={`example-collapse-text-${index}`}>{faq.answer}</div>
                        </Collapse>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FAQPage;
