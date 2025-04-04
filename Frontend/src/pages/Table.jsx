import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import FormGroup from '@mui/material/FormGroup';
import { alpha } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import Navbar from '../components/Navbar';

// Function to create data rows
function createData(id, name, calories, fat, carbs, protein) {
  return { id, name, calories, fat, carbs, protein };
}

// Helper function for sorting
function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Generate table headers dynamically based on the first data row
const generateHeadCells = (data, translations) => {
    if (!data || data.length === 0) return [];
    
    // Get the first row to extract field names
    const firstRow = data[0];
    const keys = Object.keys(firstRow).filter(key => key !== 'id');
    
    // Create column definitions with translation support
    return keys.map(key => {
      // Create a column-specific translation key
      const translationKey = `column_${key}`;
      
      // Add this key to the translation system dynamically
      if (window.currentPageTranslationKeys && 
          !window.currentPageTranslationKeys.includes(translationKey)) {
        window.currentPageTranslationKeys.push(translationKey);
      }
      

      if (window.currentPageDefaultTexts && 
          !window.currentPageDefaultTexts[translationKey]) {

        const defaultLabel = key
          .replace(/([A-Z])/g, ' $1') 
          .replace(/_/g, ' ')         
          .replace(/^\w/, c => c.toUpperCase()); 
          
        window.currentPageDefaultTexts[translationKey] = defaultLabel;
      }
      
      return {
        id: key,
        numeric: typeof firstRow[key] === 'number',
        disablePadding: false,
        label: translations[translationKey] || window.currentPageDefaultTexts?.[translationKey] || key
      };
    });
  };

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, headCells, darkMode } = props;
  
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell 
          padding="checkbox"
          sx={{ 
            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : '#f5f5f5',
            color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)'
          }}
        >
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all items',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{ 
              bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : '#f5f5f5',
              color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
              fontWeight: 600
            }}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
              sx={{
                '&.MuiTableSortLabel-root': {
                  color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.87)',
                },
                '&.MuiTableSortLabel-root.Mui-active': {
                  color: darkMode ? 'white' : 'primary.main',
                },
                '& .MuiTableSortLabel-icon': {
                  color: darkMode ? 'rgba(255, 255, 255, 0.5) !important' : 'rgba(0, 0, 0, 0.54) !important',
                }
              }}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function EnhancedTableToolbar(props) {
  const { 
    numSelected, 
    title, 
    onSearch, 
    searchQuery, 
    setSearchQuery, 
    darkMode, 
    translations,
    onFilter,
    filterOptions
  } = props;
  
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filterSelections, setFilterSelections] = useState({});

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterApply = () => {
    onFilter(filterSelections);
    handleFilterClose();
  };

  const handleFilterChange = (category, value) => {
    setFilterSelections(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const filterOpen = Boolean(filterAnchorEl);

  // Use the title from props or translations, with a fallback
  const displayTitle = title || (translations && translations.title) || 'Data Table';

  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          py: 1, 
          borderBottom: '1px solid',
          borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        },
        darkMode && {
          bgcolor: numSelected > 0 ? 
            'rgba(144, 202, 249, 0.16)' : 
            'rgb(18, 18, 18)',
          color: 'white'
        }
      ]}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 30%', fontWeight: 600 }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          {displayTitle}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', width: '50%' }}>
        <Paper
          component="form"
          sx={{ 
            p: '2px 4px', 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%',
            bgcolor: darkMode ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
            border: '1px solid',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
          }}
          elevation={1}
        >
          <InputBase
            sx={{ 
              ml: 1, 
              flex: 1, 
              color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
              '&::placeholder': {
                color: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.42)',
              }
            }}
            placeholder={translations?.search || "Search..."}
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <IconButton sx={{ p: '10px' }} aria-label="search">
            <SearchIcon sx={{ color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.54)' }} />
          </IconButton>
        </Paper>
      </Box>

      {numSelected > 0 ? (
        <Tooltip title={translations?.delete || "Delete"}>
          <IconButton>
            <DeleteIcon sx={{ color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.54)' }} />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title={translations?.filter || "Filter list"}>
          <IconButton onClick={handleFilterClick}>
            <FilterListIcon sx={{ color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.54)' }} />
          </IconButton>
        </Tooltip>
      )}

      <Popover
        open={filterOpen}
        anchorEl={filterAnchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, width: 250, bgcolor: darkMode ? 'rgba(18, 18, 18, 0)' : 'white', color: darkMode ? 'white' : 'black' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {translations?.filterOptions || "Filter Options"}
          </Typography>
          
          {filterOptions && Object.keys(filterOptions).map((category) => (
            <Box key={category} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {category}
              </Typography>
              <FormGroup>
                {filterOptions[category].map((option) => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox 
                        checked={filterSelections[category] === option} 
                        onChange={() => handleFilterChange(category, option)}
                        sx={{ color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.54)' }}
                      />
                    }
                    label={option}
                    sx={{ color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)' }}
                  />
                ))}
              </FormGroup>
            </Box>
          ))}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleFilterClose} sx={{ mr: 1 }}>
              {translations?.cancel || "Cancel"}
            </Button>
            <Button 
              onClick={handleFilterApply} 
              variant="contained" 
              color="primary"
            >
              {translations?.apply || "Apply"}
            </Button>
          </Box>
        </Box>
      </Popover>
    </Toolbar>
  );
}

export default function DataTable() {
  const navigate = useNavigate();
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('calories');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [headCells, setHeadCells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [tableTitle, setTableTitle] = useState('');
  const [translations, setTranslations] = useState({});
  const [filterOptions, setFilterOptions] = useState({
    category: ['Desserts', 'Main Courses', 'Appetizers'],
    dietaryRestrictions: ['Vegetarian', 'Vegan', 'Gluten-Free']
  });
  const [densePaddingLabel, setDensePaddingLabel] = useState('Dense padding');

  // Sample API endpoint - replace with your actual API endpoint
  const API_ENDPOINT = import.meta.env.REACT_APP_API_ENDPOINT || '/api/data';

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
        try {
          setLoading(true);
          
          console.log("Fetching from:", API_ENDPOINT);
          
          try {
            const response = await fetch(API_ENDPOINT);
            
            if (!response.ok) {
              throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
        
            const contentType = response.headers.get("content-type");
            console.log("Response content type:", contentType);
            
            if (!contentType || !contentType.includes("application/json")) {
              const textResponse = await response.text();
              console.error("Non-JSON response received:", textResponse.substring(0, 100) + "...");
              throw new Error("Expected JSON response but got: " + contentType);
            }
            
            const data = await response.json();
            const title = response.headers.get('X-Title') || 'Nutrition Data';

            if (window.currentPageTranslationKeys && 
                !window.currentPageTranslationKeys.includes('title')) {
              window.currentPageTranslationKeys.push('title');
            }
      
            if (window.currentPageDefaultTexts) {
              window.currentPageDefaultTexts.title = title;
            }
            
            setRows(data);
            setFilteredRows(data);
            setTableTitle(title);
            
            // Generate head cells dynamically based on data
            const dynamicHeadCells = generateHeadCells(data, translations);
            setHeadCells(dynamicHeadCells);
            
            // Set default orderBy to the first column (after id)
            if (dynamicHeadCells.length > 0) {
              setOrderBy(dynamicHeadCells[0].id);
            }
          } catch (error) {
            console.log("API fetch failed, using sample data instead:", error);
          
          // Sample data
          const sampleRows = [
            createData(1, 'Cupcake', 305, 3.7, 67, 4.3),
            createData(2, 'Donut', 452, 25.0, 51, 4.9),
            createData(3, 'Eclair', 262, 16.0, 24, 6.0),
            createData(4, 'Frozen yoghurt', 159, 6.0, 24, 4.0),
            createData(5, 'Gingerbread', 356, 16.0, 49, 3.9),
            createData(6, 'Honeycomb', 408, 3.2, 87, 6.5),
            createData(7, 'Ice cream sandwich', 237, 9.0, 37, 4.3),
            createData(8, 'Jelly Bean', 375, 0.0, 94, 0.0),
            createData(9, 'KitKat', 518, 26.0, 65, 7.0),
            createData(10, 'Lollipop', 392, 0.2, 98, 0.0),
            createData(11, 'Marshmallow', 318, 0, 81, 2.0),
            createData(12, 'Nougat', 360, 19.0, 9, 37.0),
            createData(13, 'Oreo', 437, 18.0, 63, 4.0),
          ];
          
          setRows(sampleRows);
          setFilteredRows(sampleRows);
          setTableTitle('Nutrition Data');
          
          const dynamicHeadCells = generateHeadCells(sampleRows, translations);
          setHeadCells(dynamicHeadCells);
          
          if (dynamicHeadCells.length > 0) {
            setOrderBy(dynamicHeadCells[0].id);
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [API_ENDPOINT, translations]);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event) => {
      const newTheme = event.detail?.theme || 
                      (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      setDarkMode(newTheme === 'dark');
    };
    
    const isDarkMode = document.documentElement.classList.contains('dark') || 
                      window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDarkMode);
    
    window.addEventListener('themeChange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  // Listen for language changes
useEffect(() => {
  const handleLanguageChange = (event) => {
    if (event.detail && event.detail.translations) {
      console.log("Language change detected:", event.detail);
      setTranslations(current => {
        const newTranslations = {...current, ...event.detail.translations};
        
        // Update head cells with new translations
        if (rows.length > 0) {
          // Regenerate head cells with new translations
          const updatedHeadCells = generateHeadCells(rows, newTranslations);
          setHeadCells(updatedHeadCells);
        }
        
        // Update the densePadding label
        if (newTranslations.densePadding) {
          setDensePaddingLabel(newTranslations.densePadding);
        }
        
        return newTranslations;
      });
    }
  };
  
  window.addEventListener('languageChange', handleLanguageChange);
  
  return () => {
    window.removeEventListener('languageChange', handleLanguageChange);
  };
}, [rows]);  // Add rows as a dependency
  

useEffect(() => {
    window.currentPageTranslationKeys = [
      'noData', 'search',
      'filter', 'filterOptions', 'apply', 'cancel', 'delete', 
      'rowsPerPage', 'back', 'densePadding'
    ];
    
    window.currentPageDefaultTexts = {

      noData: 'No data found',
      search: 'Search...',
      filter: 'Filter list',
      filterOptions: 'Filter Options',
      apply: 'Apply',
      cancel: 'Cancel',
      delete: 'Delete',
      rowsPerPage: 'Rows per page:',
      back: 'Back',
      densePadding: 'Dense padding'
    };
    
    setDensePaddingLabel(window.currentPageDefaultTexts.densePadding);
    
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage && storedLanguage !== 'english') {
      window.dispatchEvent(new CustomEvent('pageLoaded', { 
        detail: { needsTranslation: true, language: storedLanguage } 
      }));
    }

    return () => {
      delete window.currentPageTranslationKeys;
      delete window.currentPageDefaultTexts;
    };
  }, []);

  const handleSearch = (query) => {
    if (!query) {
      setFilteredRows(rows);
      return;
    }
    
    const searchableColumns = headCells.map(cell => cell.id);
    
    const filtered = rows.filter(row => 
      searchableColumns.some(column => {
        const value = row[column];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(query.toLowerCase());
        }
        if (typeof value === 'number') {
          return value.toString().includes(query);
        }
        return false;
      })
    );
    
    setFilteredRows(filtered);
    setPage(0);
  };

  const handleFilter = (filterSelections) => {
    // Implement the filter logic here
    console.log("Applying filters:", filterSelections);
    
    // This is just a simple example - modify based on your needs
    let filtered = [...rows];
    
    // Apply actual filters if they were implemented for real data
    // For now just log the selected filters
    
    setFilteredRows(filtered);
    setPage(0);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredRows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const handleBackClick = () => {
    navigate('/visChoice');
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredRows.length) : 0;

  const visibleRows = React.useMemo(
    () =>
      filteredRows
        .slice()
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, filteredRows],
  );

  return (
    <Box 
      sx={{ 
        width: '100vw',
        minHeight: '100vh',
        backgroundImage:'url(/table-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        pt: 0,
        transition: 'background-image 0.3s ease-in-out',
        bgcolor: darkMode ? '#121212' : '#f5f5f5',
      }}
    >
      <Navbar />
      <Paper 
        sx={{ 
          width: '96%',
          margin: '1rem auto',
          mb: 2, 
          bgcolor: darkMode ? 'rgb(18, 18, 18)' : 'white',
          color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 3,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out', 
        }}
      >
        <EnhancedTableToolbar 
          numSelected={selected.length} 
          title={translations?.title || tableTitle}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          darkMode={darkMode}
          translations={translations}
          onFilter={handleFilter}
          filterOptions={filterOptions}
        />
        <TableContainer sx={{ flexGrow: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : filteredRows.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography sx={{ color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)' }}>
                {translations.noData || 'No data found'}
              </Typography>
            </Box>
          ) : (
            <Table
              sx={{ minWidth: 750 }}
              aria-labelledby="tableTitle"
              size={dense ? 'small' : 'medium'}
            >
              <EnhancedTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={filteredRows.length}
                headCells={headCells}
                darkMode={darkMode}
              />
              <TableBody>
                {visibleRows.map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;
  
                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{ 
                        cursor: 'pointer',
                        bgcolor: darkMode ? 'rgb(18, 18, 18)' : 'white',
                        color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)',
                        '&.Mui-selected': {
                          bgcolor: darkMode ? 'rgba(144, 202, 249, 0.16)' : 'rgba(25, 118, 210, 0.08)',
                        },
                        '&.Mui-selected:hover': {
                          bgcolor: darkMode ? 'rgba(144, 202, 249, 0.24)' : 'rgba(25, 118, 210, 0.12)',
                        },
                        '&:hover': {
                          bgcolor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <TableCell 
                        padding="checkbox"
                        sx={{ color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)' }}
                      >
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                      
                      {headCells.map((headCell, idx) => (
                        <TableCell 
                          key={headCell.id}
                          align={headCell.numeric ? 'right' : 'left'}
                          component={idx === 0 ? 'th' : 'td'}
                          id={idx === 0 ? labelId : undefined}
                          scope={idx === 0 ? 'row' : undefined}
                          padding={idx === 0 && !headCell.disablePadding ? 'none' : 'normal'}
                          sx={{ color: darkMode ? 'white' : 'rgba(0, 0, 0, 0.87)' }}
                        >
                          {row[headCell.id]}
                        </TableCell>
                      ))}
                      
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow
                    style={{
                      height: (dense ? 33 : 53) * emptyRows,
                    }}
                  >
                    <TableCell 
                      colSpan={headCells.length + 1} 
                      sx={{ bgcolor: darkMode ? 'rgb(18, 18, 18)' : 'white' }}
                    />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ 
            color: darkMode ? 'white' : 'inherit',
            '.MuiSvgIcon-root': {
              color: darkMode ? 'white' : 'inherit'
            },
            '.MuiTablePagination-selectLabel': {
              color: darkMode ? 'white' : 'inherit'
            },
            '.MuiTablePagination-displayedRows': {
              color: darkMode ? 'white' : 'inherit'
            },
            '.MuiTablePagination-select': {
              color: darkMode ? 'white' : 'inherit'
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <FormControlLabel
            control={
              <Switch 
                checked={dense} 
                onChange={handleChangeDense} 
                color="primary"
              />
            }
            label={densePaddingLabel}
            sx={{ color: darkMode ? 'white' : 'black' }}
          />
        </Box>
      </Paper>
      <footer className="mt-auto py-4 text-center backdrop-blur-sm bg-white/30 dark:bg-black/30">
        <p className="text-sm">© 2025 Data Visualization Platform</p>
      </footer>
    </Box>
    
  );
}