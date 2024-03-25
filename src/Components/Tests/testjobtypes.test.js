import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import Jobtype from "../Common/jobtype";
import { useParams, useNavigate } from 'react-router-dom';
import { addDoc } from 'firebase/firestore';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useNavigate: jest.fn(),
}));

jest.mock('firebase/firestore');

describe('Adding Job Types', () => {
    beforeEach(() => {
        // mock return values
        useParams.mockReturnValue({ businessModel: 'testModel', uid: 'testUid' });
        useNavigate.mockReturnValue(jest.fn());
        addDoc.mockResolvedValue({ id: 'newDocId' }); // Mock addDoc to resolve to an object with an id
    });

    it('submits job types data and navigates to the home page', async () => {
        render(<Jobtype />);

        fireEvent.change(screen.getByLabelText(/Job Type 1:/i), { target: { value: 'Type1' } });
        fireEvent.change(screen.getByLabelText(/Job Type 2:/i), { target: { value: 'Type2' } });

        fireEvent.click(screen.getByText(/Submit/i));


        await waitFor(() => {
            expect(addDoc).toHaveBeenCalled();
        });

        expect(useNavigate()).toHaveBeenCalledWith(`/`);
    });
});
