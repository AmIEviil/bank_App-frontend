import Modal from "react-bootstrap/Modal";
import { useModalStore } from "../../../store/appStore";
import styles from "./modal.module.css";

const ModalVisualizer = () => {
  const visible = useModalStore((state) => state.isModalOpen);
  const dialogClassName = useModalStore((state) => state.dialogClassName);
  const bodyClassName = useModalStore((state) => state.bodyClassName);
  const headerData = useModalStore((state) => state.headerContent);
  const mediaData = useModalStore((state) => state.modalContent);
  const footerData = useModalStore((state) => state.footerContent);
  const onClose = useModalStore((state) => state.closeModal);
  const onAccept = useModalStore((state) => state.onAccept);

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      show={visible}
      onHide={handleClose}
      animation={true}
      centered
      size="lg"
      contentClassName={styles.modalContent}
      backdropClassName={styles.backdrop}
      dialogClassName={dialogClassName}
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title>{headerData}</Modal.Title>
      </Modal.Header>

      <Modal.Body className={`${styles.modalBody} ${bodyClassName}`}>
        {mediaData}
      </Modal.Body>

      <Modal.Footer className={styles.modalFooter}>
        {footerData || (
          <>
            <button className="btn-secondary" onClick={handleClose}>
              Cancelar
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                if (onAccept) onAccept();
                handleClose();
              }}
            >
              Aceptar
            </button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ModalVisualizer;
