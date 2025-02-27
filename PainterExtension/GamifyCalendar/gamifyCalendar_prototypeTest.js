// ==================== Bank, Badge, Cosmetic, Shop ====================

class Bank {
    constructor(userId, balance = 0, cosmetics = [], badges = []) {
      this.userId = userId;
      this.balance = balance; // points balance
      this.cosmetics = cosmetics; // array of Cosmetic objects
      this.badges = badges; // array of Badge objects
    }
  
    addPoints(points) {     // Adds however many points depending on success criteria
      this.balance += points;
      console.log(`Added ${points} points. New balance: ${this.balance}`);
    }
  
    subtractPoints(points) {    // Subtracts points if there are enough funds (used in shop)
      if (this.balance >= points) {
        this.balance -= points;
        console.log(`Subtracted ${points} points. New balance: ${this.balance}`);
        return true;
      }
      console.log("Insufficient funds");    // In the case there is not enough points in the users balance
      return false;
    }
  
    buyCosmetic(cosmetic, cost) {   // Add a cosmetic to the users "cosmetic list" if there are enough funds
      if (this.subtractPoints(cost)) {
        this.cosmetics.push(cosmetic);
        console.log(`Purchased cosmetic: ${cosmetic.name}`);
        return true;
      }
      return false; // Assuming there are not enough points
    }
  
    addBadge(badge) {
      if (!this.badges.some(b => b.name === badge.name)) {  // Ensures each badge that exists in the users reserve is NOT the badge currently being obtained
        this.badges.push(badge);
        console.log(`Achieved badge: ${badge.name}`);
      }
    }
  }
  
  class Badge {
    constructor(name, criteria) {
      this.name = name;
      this.criteria = criteria; // Can vary depending on total points earned, total assignmetns turned in, grades on assignments, etc.
    }
  }
  
  class Cosmetic {
    constructor(name, cost, description) {
      this.name = name;
      this.cost = cost;
      this.description = description;
      // Cosmetics are to be determined. Might add more here, but likely will stick with badges!
      // Cosmetics may turn into purchasable badges
    }
  }
  
  class Shop {
    constructor(items = []) {
      // items: array of objects { name, cost, description, cosmetic }
      this.items = items;
    }
  
    listItems() {
      console.log("Shop Items: ");  // Displays each item in the console log describing what can be purchased
      this.items.forEach(item => {
        console.log(`${item.name}: ${item.cost} points -- ${item.description}`);
      });
    }
  
    getItem(itemName) {
      return this.items.find(item => item.name === itemName);
    }
  }
  
  // ==================== Assignment and Calendar ====================
  
  class Assignment {
    constructor(title, dueDate) {
      this.title = title;
      this.dueDate = new Date(dueDate);
      this.completionDate = null;
    }
  
    complete(dateCompleted) {
      this.completionDate = new Date(dateCompleted);
    }
  
    // Check if completed before the due date
    isEarly() {
      if (this.completionDate) {
        return this.completionDate < this.dueDate;
      }
      return false;
    }
  
    // Check if completed exactly on time (you can adjust this criteria)
    isOnTime() {
      if (this.completionDate) {
        return this.completionDate.toDateString() === this.dueDate.toDateString();
      }
      return false;
    }
  
    // Check if completed after the due date
    isLate() {
      if (this.completionDate) {
        return this.completionDate > this.dueDate;
      }
      return false;
    }
  }
  
  class Calendar {
    constructor(bank) {
      this.assignments = []; // List of Assignment objects
      this.bank = bank;      // The Bank instance for the user
    }
  
    // Add a new assignment to the calendar
    addAssignment(title, dueDate) {
      const assignment = new Assignment(title, dueDate);
      this.assignments.push(assignment);
      console.log(`Added assignment: "${title}" due ${assignment.dueDate.toDateString()}`);
    }
  
    // Mark an assignment as complete and award points/badges accordingly
    completeAssignment(title, completionDate) {
      const assignment = this.assignments.find(a => a.title === title);
      if (!assignment) {
        console.log(`Assignment "${title}" not found.`);
        return;
      }
      assignment.complete(completionDate);
      if (assignment.isEarly()) {
        console.log(`Assignment "${title}" completed early!`);
        this.bank.addPoints(10); // Reward for early completion
        this.bank.addBadge(new Badge("Early Bird", "Completed assignment early"));
      } else if (assignment.isOnTime()) {
        console.log(`Assignment "${title}" completed on time!`);
        this.bank.addPoints(5); // Reward for on-time completion
      } else if (assignment.isLate()) {
        console.log(`Assignment "${title}" completed late.`);
        // Optionally: subtract points or give no reward
      }
    }
  
    // Display all assignments on the calendar
    showCalendar() {
      console.log("=== Calendar ===");
      this.assignments.forEach(assignment => {
        console.log(`Assignment: "${assignment.title}"`);
        console.log(`  Due Date: ${assignment.dueDate.toDateString()}`);
        console.log(`  Completion Date: ${assignment.completionDate ? assignment.completionDate.toDateString() : "Not Completed"}`);
      });
    }
  }
  
  // ==================== User Bank Storage (Simulated) ====================
  
  // In a real implementation, you might load/save this from a JSON file.
  // Here we simulate a bank dictionary keyed by user ID.
  const banks = {};
  
  function getBankForUser(userId) {
    if (!banks[userId]) {
      // For example, start every new user with 0 points
      banks[userId] = new Bank(userId, 0, [], []);
    }
    return banks[userId];
  }
  
  // ==================== Example Usage ====================
  
  // Simulate a user with userID 'user123'
  const userId = "user123";
  const userBank = getBankForUser(userId);
  
  // Create the Calendar feature for the user
  const canvasCalendar = new Calendar(userBank);
  
  // Add some assignments
  canvasCalendar.addAssignment("Math Homework", "2025-03-01");
  canvasCalendar.addAssignment("Science Project", "2025-03-05");
  
  // Complete assignments (dates can be in YYYY-MM-DD format or any format recognized by Date)
  canvasCalendar.completeAssignment("Math Homework", "2025-02-27");  // Early completion
  canvasCalendar.completeAssignment("Science Project", "2025-03-05"); // On-time completion
  
  // Display the calendar
  canvasCalendar.showCalendar();
  
  // Check user’s bank status
  console.log(`User Balance: ${userBank.balance}`);
  console.log("Badges Earned:", userBank.badges.map(badge => badge.name));
  
  // ==================== Shop Example ====================
  
  // Define some cosmetic items available in the shop
  const shopItems = [
    {
      name: "Cool Avatar",
      cost: 20,
      description: "A stylish avatar to show off your achievements.",
      cosmetic: new Cosmetic("Cool Avatar", "A stylish avatar image")
    },
    {
      name: "Theme Pack",
      cost: 50,
      description: "A set of themes to customize your Canvas look.",
      cosmetic: new Cosmetic("Theme Pack", "Multiple themes available")
    }
  ];
  
  // Create a Shop instance
  const cosmeticShop = new Shop(shopItems);
  
  // List available shop items
  cosmeticShop.listItems();
  
  // Attempt to purchase an item
  const itemToBuy = cosmeticShop.getItem("Cool Avatar");
  if (itemToBuy) {
    userBank.buyCosmetic(itemToBuy.cosmetic, itemToBuy.cost);
  }
  