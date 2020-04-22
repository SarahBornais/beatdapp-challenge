import React from 'react';
import './App.css';
import Modal from 'react-modal';
import PieChart from 'react-minimal-pie-chart';


export default class App extends React.Component {
  
  constructor() {
    super();

    this.state = {
      modalIsOpen: false,
      expenses: [],
      expenseToAdd: {},
      categories: [],
      categoriesToShow: [],
      idCount: 0,
      errorMessage: "",
      expenseValid: true,
    };

    this.openModal = this.openModal.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleCategoryFocus = this.handleCategoryFocus.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.addExpense = this.addExpense.bind(this);
    this.validateExpense = this.validateExpense.bind(this);
    this.deleteExpense = this.deleteExpense.bind(this);
  }

  openModal() {
    this.setState({ expenseValid: true });
    this.setState({ modalIsOpen: true });
  }

  // Update the state 'expenseToAdd' object when the user inputing data about
  // a new expense
  handleInputChange(event) {
    const name = event.target.name;
    const value = event.target.value;

    this.setState(state => {
      const expenseToAdd = state.expenseToAdd;
      expenseToAdd[name] = value;
      return { expenseToAdd };
    });
  }

  // When the user initially focuses on the category input, display all saved
  // categories
  handleCategoryFocus() {
    this.setState(state => {
      const categoriesToShow = [ ...state.categories.map(category => category.title) ];
      return { categoriesToShow };
    });
  }

  // Update the category options shown based on what the user has input so far (remove any
  // categories that don't contain what the user has typed)
  handleCategoryChange(event) {
    const value = event.target.value;
    this.setState(state => {
      const categoriesToShow = state.categories.filter(category => category.title.toLowerCase().includes(value.toLowerCase()))
                                               .map(category => category.title);
      return { categoriesToShow };
    });

    this.handleInputChange(event);
  }

  // Update the state to reflect a new expense
  addExpense(event) {
    // Check if the expense the user entered is valid, and if it's not, display a
    // descriptive error message
    var validation = this.validateExpense();
    this.setState({ expenseValid: validation.valid });
    if (validation.valid === false) {
      event.preventDefault();
      this.setState({ errorMessage: validation.errorMessage });
      return;
    }

    // Add the expense to the 'expense' array
    var expenseToAdd = { ...this.state.expenseToAdd };
    expenseToAdd.id = this.state.idCount;
    expenseToAdd.cost = parseFloat(expenseToAdd.cost).toFixed(2);
    const expenses = [...this.state.expenses, expenseToAdd];

    this.setState({ expenses: expenses });

    // Update the id counter (used for generating a unique id for each expense)
    const idCount = this.state.idCount + 1;
    this.setState({ idCount: idCount });

    // Update the 'categories' array
    var categories;
    if (this.state.categories.find(category => category.title === expenseToAdd.category) === undefined) {
      // Add the category of the expense to the 'categories' array if it isn't already there
      var newCategory = {};
      newCategory.title = expenseToAdd.category;
      newCategory.value = parseFloat(expenseToAdd.cost).toFixed(2);
      // Choose a random color that isn't too bright or too dark
      newCategory.color = "hsl(" + Math.random() * 360 + ", 54%, 61%)";
      categories = [ ...this.state.categories, newCategory ];
    } else {
      // Otherwise, add the expense's the cost value associated with its category
      categories = this.state.categories.map(category => {
        if (category.title === expenseToAdd.category) {
          category.value = +parseFloat(category.value).toFixed(2) + +parseFloat(expenseToAdd.cost).toFixed(2);
          return category;
        }
        return category;
      })
    }

    this.setState({ categories: categories });

    // Close the modal and reset the 'expenseToAdd' object
    this.setState({ modalIsOpen: false });
    this.setState({ expenseToAdd: {} });
  }

  // Check if the data that the user input is consistent about the expense is valid
  validateExpense() {
    var validation = {};
    validation.valid = false;
    if (this.state.expenseToAdd.name === undefined) {
      validation.errorMessage = "Expense name cannot be empty";
    } else if (this.state.expenseToAdd.cost === undefined) {
      validation.errorMessage = "Cost cannot be empty";
    } else if (this.state.expenseToAdd.category === undefined) {
      validation.errorMessage = "Category cannot be empty";
    } else if (isNaN(this.state.expenseToAdd.cost))  {
      validation.errorMessage = "Cost needs to be a number";
    } else {
      validation.valid = true;
    }

    return validation;
  }

  // Delete an expense from the state by its id
  deleteExpense(id) {
    const expenseToRemove = this.state.expenses.find(expense => expense.id === id);

    // Remove the expense from the 'expenses' array
    const expenses = this.state.expenses.filter(expense => expense.id !== id);
    this.setState({ expenses: expenses });

    // Update the category list
    var category = this.state.categories.find(category => category.title === expenseToRemove.category);
    var categories;
    if (category.value <= expenseToRemove.cost) {
      // Remove the category from the list if the expense that is being deleted was the last
      // expense associated with that category
      categories = this.state.categories.filter(category => category.title !== expenseToRemove.category);
    } else {
      // Otherwise, subtract the deleted expense's the cost value associated with its category
      categories = this.state.categories.map(category => {
        if (category.title === expenseToRemove.category) {
          category.value -= expenseToRemove.cost;
        }
        return category;
      });
    }
    
    this.setState({ categories: categories });
  }

  render() {
    const modalStyles = {
      content : {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)'
      }
    };

    return (
      <div className="App">
        <div className="header">
          <button id="add-expense-button" onClick={this.openModal}>Add expense</button>
        </div>
        <div className="col-1">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Cost</th>
                <th>Category</th>
                <th style={{width: "40px"}}></th>
              </tr>
            </thead>
            <tbody>
              {this.state.expenses.length === 0 ? <tr><td colSpan="4">When you add expenses, they will show up here</td></tr> : null}
              {this.state.expenses.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>${item.cost}</td>
                  <td>{item.category}</td>
                  <td className="delete-button" onClick={() => this.deleteExpense(item.id)}></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="charts">
            <div id="pie-chart">
              <PieChart
                data={[ ...this.state.categories ].map(category => {
                  var roundedCategory = {...category};
                  roundedCategory.value = Math.round(category.value);
                  return roundedCategory;
                })}
                label={props => { return props.data[props.dataIndex].title; }}
                labelStyle={{
                  fontSize: '5px',
                  fontFamily: 'sans-serif',
                }}
                labelPosition={60}
                lengthAngle={360}
                lineWidth={20}
                paddingAngle={18}
                radius={50}
                rounded
                startAngle={0}
                viewBoxSize={[
                  100,
                  100
                ]}
              />
            </div>
          </div>
        </div>
        <Modal
          isOpen={this.state.modalIsOpen}
          style={modalStyles}
          contentLabel="Example Modal"
          appElement={document.body}
        >
          <div className="modal-header">
            <p>Add Expense</p>
            <button id="close-button" onClick={() => this.setState({modalIsOpen: false})}>X</button>
          </div>
          
          <form onSubmit={this.addExpense} autoComplete="off">
            <input name="name" type="text" placeholder="Name of purchase" onChange={this.handleInputChange}></input>
            <input name="cost" type="text" placeholder="Cost" onChange={this.handleInputChange}></input>
            <input 
              name="category" 
              type="text" 
              placeholder="Category" 
              list="categories"
              onChange={this.handleCategoryChange} 
              onFocus={this.handleCategoryFocus} 
              onBlur={() => this.setState({categoriesToShow: []})}
            />
            <datalist id="categories">
              {this.state.categoriesToShow.map(item => (
                <option>{item}</option>
              ))}
            </datalist>
            <div id="modal-button-div">
              <button id="submit-button" type="submit">Submit</button>
              <button id="cancel-button" onClick={() => this.setState({modalIsOpen: false})}>Cancel</button>
            </div>
          </form>
          {this.state.expenseValid ? null : <p id="error-message">{this.state.errorMessage}</p>}
        </Modal>
      </div>
    );
  }
}

