import { Modal } from '@mui/material';
import FormWrapper from './FormWrapper.jsx';
import CustomAvatar from './CustomAvatar.jsx';

export default function UserModal({ open, onClose, user }) {
    return (
        <Modal disableScrollLock open={open}>
            <FormWrapper title={user?.username} onClose={onClose} logo={false} sx={{ width: 400, height: 450, pb: 9 }}>
            <CustomAvatar
                variant="rounded"
                src={user?.avatar}
                alt={user?.username}
                key={user?._id + "_2"}
                color={"white"}
                sx={{ border: 0, outline: 3, outlineColor: 'primary.main', color: 'primary.main', width: "100%", height: "100%", borderRadius: 10 }}
            />
            </FormWrapper>
        </Modal>
    );
}