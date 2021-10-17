import { ROLES } from '../config';

const AccessCodesTable = ({ mode = 'dark', codes = [], newAccessCode }) => {
  return (
    // <table className="table table-striped table-dark mb-0">
    <table className={`table table-striped table-${mode} mb-0`}>
      <thead>
        <tr className="th-no-borders">
          <th>Role</th>
          <th>Code</th>
        </tr>
      </thead>
      <tbody>
        {codes.map((code) => {
          // console.log({ newAccessCode, code });
          return (
            <tr
              key={code.hash}
              className={
                !!newAccessCode &&
                newAccessCode === code.hash &&
                'table-primary text-dark'
              }
            >
              <td>{ROLES[code.role].name}</td>
              <td>{code.hash}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default AccessCodesTable;
