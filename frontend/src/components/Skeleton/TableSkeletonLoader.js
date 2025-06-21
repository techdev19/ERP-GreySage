import { TableCell, TableRow, Skeleton } from '@mui/material';

export const TableRowsLoader = ({ colsNum, rowsNum }) => {
    return [...Array(rowsNum)].map((row, index) => (
        <TableRow key={index}>
            {[...Array(colsNum)].map((col, idx) => {
                return (
                    <TableCell>
                        <Skeleton animation="wave" variant="text" />
                    </TableCell>)
            })}
        </TableRow>
    ));
};

export const NoRecordRow = () => {
    return (
        <TableRow>
            <TableCell sx={{ width: 155 }}>No Record Found</TableCell>
        </TableRow>
    )
}