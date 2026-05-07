import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import './modal.scss';

const Modal = props => {

    const [active, setActive] = useState(false);
    const modalRef = useRef(null);

    useEffect(() => {
        setActive(props.active);
    }, [props.active]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && active) {
                closeModal();
            }
        };

        const handleClickOutside = (e) => {
            if (modalRef.current && e.target === modalRef.current && active) {
                closeModal();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [active]);

    const closeModal = () => {
        if (modalRef.current) {
            modalRef.current.classList.remove('active');
            const modalContent = modalRef.current.querySelector('.modal__content');
            if (modalContent) {
                modalContent.innerHTML = '';
            }
        }
    };

    return (
        <div ref={modalRef} id={props.id} className={`modal ${active ? 'active' : ''}`}>
            {props.children}
        </div>
    );
}

Modal.propTypes = {
    active: PropTypes.bool,
    id: PropTypes.string
}

export const ModalContent = props => {

    const contentRef = useRef(null);
    const closeModal = () => {
        contentRef.current.parentNode.classList.remove('active');
        if (props.onClose) props.onClose();
    }

    return (
        <div ref={contentRef} className="modal__content">
            {props.children}
            <div className="modal__content__close" onClick={closeModal}>
                <i className="bx bx-x"></i>
            </div>
        </div>
    );
}

ModalContent.propTypes = {
    onClose: PropTypes.func
}

export default Modal
