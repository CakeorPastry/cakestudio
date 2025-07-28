local AuxiliaryModule = {}

-- Kernel
AuxiliaryModule.Kernel = {}
AuxiliaryModule.Kernel.Cache = {}
AuxiliaryModule.Kernel.RecycleBin = {}
AuxiliaryModule.Kernel.SystemClock = {}

-- Gui Stuff
local sections = {}
local sectionNames = {} -- Example: "Main", "Auxiliary", "Others", "Help", "About"

-- Missing
function missing(t, f, fallback)
    if type(f) == t then return f end
    return fallback
end

-- Exploit Functions
local cloneref = missing("function", cloneref, function(...) return ... end)

local everyClipboard = missing("function", setclipboard or toclipboard or set_clipboard or (Clipboard and Clipboard.set))

local httprequest =  missing("function", request or http_request or (syn and syn.request) or (http and http.request) or (fluxus and fluxus.request))

local waxwritefile, waxreadfile = writefile, readfile

local writefile = missing("function", waxwritefile) and function(file, data, safe)
    if safe == true then return pcall(waxwritefile, file, data) end
    waxwritefile(file, data)
end

local readfile = missing("function", waxreadfile) and function(file, safe)
    if safe == true then return pcall(waxreadfile, file) end
    return waxreadfile(file)
end

local isfile = missing("function", isfile, readfile and function(file)
    local success, result = pcall(function()
        return readfile(file)
    end)
    return success and result ~= nil and result ~= ""
end)

local makefolder = missing("function", makefolder)

local isfolder = missing("function", isfolder)

local waxgetcustomasset = missing("function", getcustomasset or getsynasset)

local hookfunction = missing("function", hookfunction)

local hookmetamethod = missing("function", hookmetamethod)

-- Services
local CoreGui = cloneref(game:GetService("CoreGui"))

local Players = cloneref(game:GetService("Players"))

local ReplicatedStorage = cloneref(game:GetService("ReplicatedStorage"))

local TweenService = cloneref(game:GetService("TweenService"))

local RunService = cloneref(game:GetService("RunService"))

local PathfindingService = cloneref(game:GetService("PathfindingService"))

local TextChatService = cloneref(game:GetService("TextChatService"))

-- Player Elements
AuxiliaryModule.Player = Players.LocalPlayer

AuxiliaryModule.Character = AuxiliaryModule.Player.Character or AuxiliaryModule.Player.CharacterAdded:Wait()

AuxiliaryModule.Player.CharacterAdded:Connect(function(Character) 
    AuxiliaryModule.Character = Character; 
end);

-- Auxiliary Functions (Shared)
--[[
function AuxiliaryModule.toClipboard(txt)
    if everyClipboard then
        everyClipboard(tostring(txt))
        notify("Clipboard", "Copied to clipboard")
    else
        notify("Clipboard", "Your exploit doesn't have the ability to use the clipboard")
    end
end

FIXME FIXME FIXME

]]

function AuxiliaryModule.Kernel.randomString() 
    local length = math.random(10, 20)
    local array = {}
    for i = 1, length do
        array[i] = string.char(math.random(32, 126))
    end

    return table.concat(array)
end

-- Gui Functions
function createSection(name, parent)
        local section = Instance.new("Frame")
        section.Name = name
        section.Size = UDim2.new(1, 0, 0, 0)
        section.AutomaticSize = Enum.AutomaticSize.Y
        section.BackgroundTransparency = 1
        section.Visible = (name == "Main")
        section.ZIndex = 2
        section.Parent = parent
        sections[name] = section
        return section
end

function createSidebarButton(name, parent)
        local button = Instance.new("TextButton")
        button.Size = UDim2.new(1, -12, 0, 30)
        button.Text = name
        button.BackgroundColor3 = Color3.new(0, 0, 0)
        button.TextColor3 = Color3.new(1, 1, 1)
        button.Font = Enum.Font.Gotham
        button.TextSize = 14
        button.BorderSizePixel = 0
        button.AutoButtonColor = false
        button.ZIndex = 2
        button.Parent = parent

        Instance.new("UICorner", button).CornerRadius = UDim.new(0, 6)

        button.Activated:Connect(function()
                for secName, frame in pairs(sections) do
                        frame.Visible = (secName == name)
                end
                for _, sibling in ipairs(sidebar:GetChildren()) do
                        if sibling:IsA("TextButton") then
                                sibling.BackgroundColor3 = Color3.new(0, 0, 0)
                                sibling.TextColor3 = Color3.new(1, 1, 1)
                        end
                end
                button.BackgroundColor3 = Color3.new(1, 1, 1)
                button.TextColor3 = Color3.new(0, 0, 0)
        end)

        return button
end

-- Setup
AuxiliaryModule.Config = {}
local hasSetup = false

function AuxiliaryModule.Setup(...)
    local args = {...}
    local lastArg = select("#", ...) -- Returns total number of arguments
    
    local setupData = args[1] -- args is currently {{SetupData}}, this makes us access {SetupData} table
    local forceReSetup = setupData[lastArg]
    
    -- Prevent re-setup if not forced
    if hasSetup and not forceReSetup then
        AuxiliaryModule.Kernel.Throw("Setup Error", "Setup was already completed.", -1)
        return
    end
    
    -- For feedback only
    if forceReSetup and hasSetup then
        CreateNotification("Re-setting up...", "Warning", 5)   
    end
    
    --[[
    AuxiliaryModule.Config.frameWidth = setupData.frameWidth or 320
    AuxiliaryModule.Config.frameHeight = setupData.frameHeight or 220
    AuxiliaryModule.Config.headerHeight = setupData.headerHeight or 36
    ]]
    
    AuxiliaryModule.Config.frameWidth = 320
    AuxiliaryModule.Config.frameHeight = 220
    AuxiliaryModule.Config.headerHeight = 36
        
end

function createScreenGui(...)
    local args = {...}
    local settings = args[1]
    
    local returnData = {}
    
    local sectionNames = settings["sectionNames"]
    
    -- screenGui
    local screenGui = Instance.new("ScreenGui", CoreGui)
    local screenGui.Name = AuxiliaryModule.Kernel.randomString()
    screenGui.ResetOnSpawn = false
    
    returnData[screenGui] = screenGui
    
    -- Output
    local notificationFrame = Instance.new("Frame")
notificationFrame.Size = UDim2.new(0, 626, 0, 59)
notificationFrame.Position = UDim2.new(0.5, 0, 0.268415093, 0)
notificationFrame.AnchorPoint = Vector2.new(0.5, 0.5)
notificationFrame.BackgroundTransparency = 1
notificationFrame.Parent = screenGui
notificationFrame.Name = "Output"

local gridLayout = Instance.new("UIGridLayout")
gridLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left
gridLayout.VerticalAlignment = Enum.VerticalAlignment.Bottom
gridLayout.SortOrder = Enum.SortOrder.LayoutOrder
gridLayout.StartCorner = Enum.StartCorner.TopLeft
gridLayout.CellPadding = UDim2.new(0, 0, 0, 0)
gridLayout.CellSize = UDim2.new(1, 0, 0.349999994, 0)
gridLayout.Parent = notificationFrame

returnData[notificationFrame] = notificationFrame
    
    -- MAIN FRAME
local mainFrame = Instance.new("Frame", screenGui)
mainFrame.Name = "UnifiedFrame"
mainFrame.Size = UDim2.new(0, AuxiliaryModule.frameWidth, 0, AuxiliaryModule.Config.frameHeight)
mainFrame.Position = UDim2.new(0, 10, 0, 100)
mainFrame.BackgroundColor3 = Color3.new(0, 0, 0)
mainFrame.BorderSizePixel = 0
mainFrame.Active = true
mainFrame.Draggable = true
mainFrame.ClipsDescendants = true
mainFrame.ZIndex = 2

Instance.new("UICorner", mainFrame).CornerRadius = UDim.new(0, 12) 

returnData[mainFrame] = mainFrame

-- HEADER
local header = Instance.new("Frame", mainFrame)
header.Name = "Header"
header.Size = UDim2.new(1, 0, 0, AuxiliaryModule.headerHeight)
header.BackgroundTransparency = 1
header.ZIndex = 3

returnData[header] = header

local titleLabel = Instance.new("TextLabel", header)
titleLabel.Size = UDim2.new(1, -40, 1, 0)
titleLabel.Position = UDim2.new(0, 10, 0, 0)
titleLabel.BackgroundTransparency = 1
titleLabel.Text = settings[title] or "JOHNSTONHIGHSCHOOL"
titleLabel.TextColor3 = Color3.new(1, 1, 1)
titleLabel.Font = Enum.Font.GothamBold
titleLabel.TextSize = 20
titleLabel.TextXAlignment = Enum.TextXAlignment.Left
titleLabel.ZIndex = 4

returnData[titleLabel] = titleLabel

local toggleButton = Instance.new("TextButton", header)
toggleButton.Size = UDim2.new(0, 30, 0, 30)
toggleButton.Position = UDim2.new(1, -36, 0, 3)
toggleButton.Text = "-"
toggleButton.BackgroundColor3 = Color3.new(1, 1, 1)
toggleButton.TextColor3 = Color3.new(0, 0, 0)
toggleButton.Font = Enum.Font.GothamBold
toggleButton.TextSize = 20
toggleButton.BorderSizePixel = 0
toggleButton.AutoButtonColor = false
toggleButton.ZIndex = 4

Instance.new("UICorner", toggleButton).CornerRadius = UDim.new(0, 6)

returnData[toggleButton] = toggleButton

-- WRAPPER (Below header)
local wrapper = Instance.new("Frame", mainFrame)
wrapper.Name = "Wrapper"
wrapper.Position = UDim2.new(0, 0, 0, AuxiliaryModule.headerHeight)
wrapper.Size = UDim2.new(1, 0, 1, -AuxiliaryModule.headerHeight)
wrapper.BackgroundTransparency = 1
wrapper.ZIndex = 2

returnData[wrapper] = wrapper

-- SIDEBAR (Before Unscrollable, Now Scrollable)
local sidebar = Instance.new("ScrollingFrame", wrapper)
sidebar.Name = "Sidebar"
sidebar.Size = UDim2.new(0, 80, 1, 0)
sidebar.Position = UDim2.new(0, 0, 0, 0)
sidebar.BackgroundColor3 = Color3.fromRGB(10, 10, 10)
sidebar.ScrollBarThickness = 6
sidebar.BorderSizePixel = 0
sidebar.ScrollingDirection = Enum.ScrollingDirection.Y
sidebar.AutomaticCanvasSize = Enum.AutomaticSize.Y
sidebar.ZIndex = 2

Instance.new("UICorner", sidebar).CornerRadius = UDim.new(0, 6)

local sidebarLayout = Instance.new("UIListLayout", sidebar)
sidebarLayout.SortOrder = Enum.SortOrder.LayoutOrder
sidebarLayout.Padding = UDim.new(0, 6)
sidebarLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center

returnData[sidebar] = sidebar

-- CONTENT (scrollable)
local content = Instance.new("ScrollingFrame", wrapper)
content.Name = "Content"
content.Position = UDim2.new(0, 80, 0, 0)
content.Size = UDim2.new(1, -80, 1, 0)
content.BackgroundColor3 = Color3.fromRGB(10, 10, 10)
content.ScrollBarThickness = 6
content.BorderSizePixel = 0
content.ScrollingDirection = Enum.ScrollingDirection.Y
content.AutomaticCanvasSize = Enum.AutomaticSize.Y
content.ZIndex = 2

Instance.new("UICorner", content).CornerRadius = UDim.new(0, 6)

returnData[content] = content



return returnData
    
end


return AuxiliaryModule