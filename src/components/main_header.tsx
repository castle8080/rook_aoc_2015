import { Link } from 'react-router-dom';

function MainHeader() {
    return (
        <div className="main-header">
            <a href="https://adventofcode.com/2015" target="_blank" className='main-header-link'>Advent of Code 2015</a>
            <Link to="/" className='main-header-sub-link'>[Problems]</Link>
            <Link to="/results" className='main-header-sub-link'>[Results]</Link>
        </div>
    );
}

export default MainHeader;