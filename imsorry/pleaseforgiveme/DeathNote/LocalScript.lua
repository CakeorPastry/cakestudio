local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local StarterGui = game:GetService("StarterGui")
local TweenService = game:GetService("TweenService") 
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local TweenInfoSetting = TweenInfo.new(1, Enum.EasingStyle.Linear)
local Player = Players.LocalPlayer
local Character = Player.Character or Player.CharacterAdded:Wait()
local GamePhase = ReplicatedStorage:WaitForChild("Game"):WaitForChild("GamePhase")
local CanTP = true
local monitor = nil
local monitorIdBool = false

-- 🔔 Notification Function
function Notify(title, text, duration, button1)
    StarterGui:SetCore("SendNotification", {
        Title = title,
        Text = text,
        Duration = duration or 10,
        Button1 = button1
    })
end

function PlaySound(id) 
    local Sound = Instance.new("Sound")
    local finalId = id or "97495881842727"
    Sound.SoundId = "rbxassetid://"..finalId
    -- "DO NOT REDEEM" Meme Btw
    Sound.Parent = workspace
    Sound:Play() 
    Sound.Ended:Wait() 
    Sound:Destroy()
end

function FindPlayer(playerName)
    for _, plr in Players:GetPlayers() do
        local plrName = string.lower(playerName)
        -- print("Current Player:"..plr.Name)
        if string.lower(plr.Name) == plrName or string.lower(plr.DisplayName) == plrName then
            -- print(plr, plr.Name)
            return plr
        end
        -- warn(string.lower(plr.Name).." isn't the same as "..playerName)
    end
     -- print("FindPlayer() function returned nil")
    return nil
end

-- 🎯 Fetches the Player's Current ID
local function FetchCurrentId(Map, SpecifiedClient)
    if not Map then return end
    for _, v in Map:GetChildren() do
        if v.Name == "Id" and v:FindFirstChild("SurfaceGui") then
            local frame = v.SurfaceGui:FindFirstChild("Frame")
            if frame and frame:FindFirstChild("PlayerName") then
                if (frame.PlayerName.Text == SpecifiedClient.Name or frame.PlayerName.Text == SpecifiedClient.DisplayName) and v.SurfaceGui.Enabled then
                    return v
                end
            end
        end
    end
end

-- 🕵️‍♂️ Finds the Closest Player
local function closestPlayerAtPos(Position)
    local MaxRange = math.huge
    local Closest = nil

    for _, v in Players:GetPlayers() do
        local RootPart = v.Character and v.Character:FindFirstChild("HumanoidRootPart")
        if RootPart and v ~= Player then
            local Magnitude = (RootPart.Position - Position).Magnitude
            if Magnitude < MaxRange then
                Closest = {["Closest"] = v, ["Distance"] = Magnitude}
                MaxRange = Magnitude
            end
        end
    end
    return Closest
end

-- 🎛 Adjusts Prompt Properties
--[[
local function FiddleWithPrompts(Map)
    if not Map then return end
    for _, v in Map:GetChildren() do
        if v.Name == "Id" or v.Name == "Crate" then
            if v:FindFirstChild("IdPrompt") then
                v.IdPrompt.HoldDuration = 0
                v.IdPrompt.MaxActivationDistance = math.huge
                v.IdPrompt.RequiresLineOfSight = false
            end
        end
    end
end
]]

local function FiddleWithPrompts(Map) 
    if not Map then return end
    for _, v in Map:GetDescendants() do
        if v.Name == "IdPrompt" or v.Name == "BinPrompt" then
            v.HoldDuration = 0
            v.MaxActivationDistance = math.huge
            v.RequiresLineOfSight = false
        end
    end
end


local function FiddleWithAllPrompts()
    for _, v in workspace:GetDescendants() do
        if v:IsA("ProximityPrompt") then
            v.HoldDuration = 0
            v.MaxActivationDistance = math.huge
            v.RequiresLineOfSight = false
        end
    end
end

--[[
local function FillStashListForId()
    local StashList = {}
    for _, v in workspace.Map:GetChildren() do
        if v.Name == "Id" then
            table.insert(StashList, v)
        end
    end 
    return StashList
end
]]

local function FillStashListForCrate() 
    local StashList = {}
    for _, v in workspace.Map:GetChildren() do
        if v.Name == "Crate" then
            table.insert(StashList, v)
        end
    end
    return StashList
end

local function AutoKeyPressE()
    keypress(0x45)
    task.wait(0.2)      
    keyrelease(0x45)  
end

-- 🚀 Teleport Function (With Tweening Support)
local function TP(target, destination, tween)
    if target and destination and target:FindFirstChild("HumanoidRootPart") then
        if tween then
            local Tween = TweenService:Create(target.HumanoidRootPart, TweenInfoSetting, {CFrame = destination.CFrame})
            Tween:Play() 
            Tween.Completed:Wait() 
        else
            target.HumanoidRootPart.CFrame = destination.CFrame
        end
    end
end

-- 👀 Monitor ID Function
local function monitorId(playerName)
    if monitor then
        monitor:Disconnect()  -- Prevent multiple monitors running
        monitor = nil
    end

    monitorIdBool = true
    local lastClosestPlayer = nil
    local lastNotificationTime = 0
    local hasUpdatedMonitorMessage = false
    local idMissingNotified = false  -- ✅ Prevents spamming "ID not found" message

    -- Initial "Monitoring ID..." message
    CreateNotification("Monitoring ID...", Color3.new(255, 255, 0), 2.5)

    monitor = RunService.Heartbeat:Connect(function()
        if not monitorIdBool or not monitor then
            if monitor then
                monitor:Disconnect()
                monitor = nil
            end
            return
        end

        -- Ensure we always have a valid player object
        local plr = nil
        if typeof(playerName) == "string" then
            plr = FindPlayer(playerName)
        elseif typeof(playerName) == "Instance" and playerName:IsA("Player") then
            plr = playerName
        end
        plr = plr or Player -- Default to LocalPlayer if nil

        -- If player is still nil, stop monitoring
        if not plr then 
            CreateNotification("Error: Invalid Player argument!", Color3.new(255, 0, 0), 2.5)
            monitorIdBool = false
            if monitor then
                monitor:Disconnect()
                monitor = nil
            end
            return
        end

        -- ✅ Only show "Monitoring ID for ..." once
        if not hasUpdatedMonitorMessage then
            hasUpdatedMonitorMessage = true
            CreateNotification("Monitoring ID for "..plr.Name.."...", Color3.new(255, 255, 0), 2.5)
        end

        -- Fetch the player's current ID
        local id = FetchCurrentId(workspace.Map, plr)

        -- ✅ If the ID no longer exists, STOP monitoring and notify ONCE
        if not id then
            if not idMissingNotified then
                idMissingNotified = true
                CreateNotification("Error: Could not find "..plr.Name.."'s ID. Stopping monitoring!", Color3.new(255, 0, 0), 5)
            end
            monitorIdBool = false
            if monitor then
                monitor:Disconnect()
                monitor = nil
            end
            return
        end

        -- Find the closest player
        local closestPlayerData = closestPlayerAtPos(id.Position)
        if closestPlayerData then
            local closestPlayer = closestPlayerData["Closest"]
            local distance = math.floor(closestPlayerData["Distance"])

            -- ✅ Notify every 5 seconds only if the closest player changes
            if closestPlayer ~= lastClosestPlayer or (tick() - lastNotificationTime) >= 5 then
                lastNotificationTime = tick()
                lastClosestPlayer = closestPlayer

                CreateNotification(
                    "Closest player to "..plr.Name.."'s ID is "..closestPlayer.Name.." ("..distance.." studs). Use \"/unmonitorid\" to stop.",
                    Color3.new(0, 255, 0),
                    5
                )
            end
        end
    end)
end

function AutoSearch(amountPerSecond, cooldown) 
    CanSearch = true
    if not GamePhase or GamePhase.Value ~= "Search" or workspace.Map == nil then
        CreateNotification("Game isn't in searching phase.", Color3.new(255, 0, 0), 5)
        return
    end
    local StashList = FillStashListForCrate() 
    if StashList then
        FiddleWithPrompts(workspace.Map)
        local amount = tonumber(amountPerSecond) or 3
        local x = 0
        for i, v in StashList do
            if not CanSearch then break end
            Character.HumanoidRootPart.CFrame = crate.CFrame * CFrame.new(Vector3.new(0,1,0))
            AutoKeyPressE()
            local Hint = GameUI.Hint:FindFirstChild("TextLabel")
            local findMessage = string.find(string.lower(Hint.Text), "you have f")
            if Hint and findMessage then 
                CanSearch = false
                break 
            end
            x = x + 1
            if x >= amount then
                task.wait(tonumber(cooldown) or 3)
                x = 0
            end
        end
    end
end

-- 📜 Process User Commands
function ProcessCommand(command)
    if command == "" then return end
    if not command:match("^/") then
        command = "/" .. command
    end

    local args = string.split(command, " ")
    local mainCmd = string.lower(args[1])
    
    local arguments = {table.unpack(args, 2)}
    local fullyLowered = string.lower(command)
    local spookParam = string.find(fullyLowered, "?spook")
    local tweenParam = string.find(fullyLowered, "?tween")
    local autoParam = string.find(fullyLowered, "?auto")

    if mainCmd == "/myid" then
        local CurrentUserId = FetchCurrentId(workspace.Map, Player)
        if CurrentUserId and Character then
            TP(Character, CurrentUserId)
        else
            CreateNotification("Your ID couldn't be found in the game.", Color3.new(255, 0, 0), 2.5)
        end

    elseif mainCmd == "/idtp" then
        CanTP = true
        local idsAmount = 0
        local playerCFrame = Character and Character:FindFirstChild("HumanoidRootPart") and Character.HumanoidRootPart.CFrame
        local autoPickUpWarn = false
        
        if not playerCFrame then
            CreateNotification("Error: Character missing HumanoidRootPart!", Color3.new(255, 0, 0), 2.5)
        return
       end

        for _, player in Players:GetPlayers() do
            if not CanTP then break end

            local ID = FetchCurrentId(workspace.Map, player)
            if ID then
                TP(Character, ID, tweenParam and true or false)
                if autoParam then
                FiddleWithPrompts(workspace.Map)
                    if not autoPickUpWarn then
                        autoPickUpWarn = true
                        task.spawn(function() 
                            CreateNotification("AutoPickUpId can sometimes fail.", Color3.new(255, 255, 0), 2.5)
                        end) 
                    end
                    --[[
                    keypress(0x45)
                    task.wait(0.2)
                    keyrelease(0x45)
                    task.wait(0.2)
                    ]]
                    AutoKeyPressE()
                else
                    task.wait(2) -- ✅ Only waits if an ID was found
                end
                idsAmount = idsAmount + 1
                -- task.wait(2)  -- ✅ Only waits if an ID was found
             end
          end

        if spookParam and playerCFrame then
            Character.HumanoidRootPart.CFrame = playerCFrame  -- ✅ Only runs once, outside the loop
        end

        if idsAmount == 0 then
            CreateNotification("No IDs found...", Color3.new(255, 0, 0), 2.5)
        end

    elseif mainCmd == "/abortidtp" or mainCmd == "/unidtp" then
        CanTP = false
        CreateNotification("Aborted ID Teleport.", Color3.new(0, 255, 0), 2.5)

    elseif mainCmd == "/fiddlewithprompts" then
        FiddleWithPrompts(workspace.Map)
        task.spawn(function() 
           CreateNotification("All main prompts (ID and Search Prompts) can be interacted with in an instant and from any distance.", Color3.new(0, 255, 0), 5) 
        end)
        task.spawn(function() 
            CreateNotification("This command is automatically executed when the script gets loaded.", Color3.new(255, 255, 0), 5)
        end)
                
    elseif mainCmd == "/fiddlewithallprompts" then
        FiddleWithAllPrompts()
        task.spawn(function() 
            CreateNotification("All prompts can be interacted with in an instant and from any distance.", Color3.new(0, 255, 0), 5)
        end)
        task.spawn(function()
            CreateNotification("This command isn't recommended if you are going to use features like Auto Search and to pick up IDs automatically.", Color3.new(255, 0, 0), 5)
        end) 
        task.spawn(function()
            CreateNotification("You can use \"/fiddlewithprompts\" to fiddle only the main prompts.", Color3.new(255, 0, 0), 5)
        end) 
        
    elseif mainCmd == "/closestplayer" then
        local closestPlayerRaw = closestPlayerAtPos(Character.HumanoidRootPart.Position)
        local closestPlayer, closestPlayerDistance = closestPlayerRaw["Closest"], closestPlayerRaw["Distance"]
        if closestPlayer then
            task.spawn(function() 
                CreateNotification("The closest player to your current location is "..closestPlayer.Name.." and the distance is "..math.floor(closestPlayerDistance).." studs.", Color3.new(0, 255, 0), 5)
            end)
            if tweenParam and closestPlayer.Character and closestPlayer.Character:FindFirstChild("HumanoidRootPart") then
                TP(Character, closestPlayer.Character.HumanoidRootPart, true)
            end
        else
            CreateNotification("No players found.", Color3.new(255, 0, 0), 2.5)
        end

    elseif mainCmd == "/monitorid" then
        monitorIdBool = true
        --[[ task.spawn(function() 
            CreateNotification("Monitoring Id...", Color3.new(0, 255, 0), 2.5)
        end)
        ]]
        monitorId(arguments[1])
        
    elseif mainCmd == "/unmonitorid" then
        monitorIdBool = false
        monitor = nil
        CreateNotification("Monitor ID has been disabled.", Color3.new(0, 255, 0), 5)
   
    elseif mainCmd == "/notification" then
        CreateNotification("Hello, Notification Test.", Color3.new(0, 255, 0), 5)
    
    elseif mainCmd == "/autosearch" then
        CanSearch = true
        local amountPerSecond = arguments[1]
        local cooldown = arguments[2]
        AutoSearch(amountPerSecond, cooldown)
   
    elseif mainCmd == "/unautosearch" or mainCmd == "/abortautosearch" then
        CanSearch = false
        CreateNotification("Aborted Auto Search", Color3.new(0, 255, 0), 2.5)
    end
end

-- 🎨 GUI Creation
-- Command Bar
local ScreenGui = Instance.new("ScreenGui")
-- ScreenGui.Name = "ꯂꯋꯥꯏ ꯃꯆꯥ"
ScreenGui.Name = "Nikhil"
ScreenGui.Parent = game.CoreGui
ScreenGui.IgnoreGuiInset = true
ScreenGui.ScreenInsets = Enum.ScreenInsets.DeviceSafeInsets

local Frame = Instance.new("Frame")
Frame.Size = UDim2.new(0, 250, 0, 60)
Frame.Position = UDim2.new(0.5, -225, 0.1, 0)
Frame.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
Frame.BorderSizePixel = 2
Frame.Active = true
Frame.Parent = ScreenGui

local TextBox = Instance.new("TextBox")
TextBox.Size = UDim2.new(1, -40, 1, -45)
TextBox.Position = UDim2.new(0, 20, 0, 25)
TextBox.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
TextBox.TextColor3 = Color3.fromRGB(255, 255, 255)
TextBox.PlaceholderText = "Enter command..."
TextBox.TextScaled = true
TextBox.ClearTextOnFocus = false
TextBox.Parent = Frame
TextBox.RichText = true

-- Notification Gui
-- Create the ScreenGui
-- local notificationGui = Instance.new("ScreenGui")
-- notificationGui.Parent = game.CoreGui

-- Create the Frame
local notificationFrame = Instance.new("Frame")
notificationFrame.Size = UDim2.new(0, 626, 0, 59)
notificationFrame.Position = UDim2.new(0.5, 0, 0.268415093, 0)
notificationFrame.AnchorPoint = Vector2.new(0.5, 0.5)
notificationFrame.BackgroundTransparency = 1
notificationFrame.Parent = ScreenGui
notificationFrame.Name = "Output"

-- Add UIGridLayout
local gridLayout = Instance.new("UIGridLayout")
gridLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left
gridLayout.VerticalAlignment = Enum.VerticalAlignment.Bottom
gridLayout.SortOrder = Enum.SortOrder.LayoutOrder
gridLayout.StartCorner = Enum.StartCorner.TopLeft
gridLayout.CellPadding = UDim2.new(0, 0, 0, 0)
gridLayout.CellSize = UDim2.new(1, 0, 0.349999994, 0) -- Matching the TextLabel size
gridLayout.Parent = notificationFrame

local sampleText = '/commandname <font color="rgb(255, 0, 0)">&lt;argument1&gt;</font><font color="rgb(0, 255, 0)">[argument2]</font><font color="rgb(0, 0, 255)">[PARAMETERS]</font>'
local sampleTextRaw = "/commandname <argument1> [argument2] [PARAMETERS]"
TextBox.Text = sampleText

-- Function to create notifications
function CreateNotification(text, color, duration)
    local notification = Instance.new("TextLabel")
    notification.Size = UDim2.new(1, 0, 1, 0)
    notification.AnchorPoint = Vector2.new(0.5, 0, 0.5, 0)
    notification.Position = UDim2.new(0, 0, 0, 0)
    notification.TextColor3 = color or Color3.new(1, 1, 1)
    notification.BackgroundTransparency = 1
    -- notification.TextColor3 = Color3.new(1, 1, 1)
    notification.TextSize = 20
    notification.Text = text
    notification.TextTransparency = 0
    notification.TextWrapped = false
    notification.TextScaled = true
    -- print(notification.TextScaled)
    notification.Parent = notificationFrame
    task.spawn(function() 
        PlaySound("9102731048")
    end)
    -- Optional: Add a fade-out effect before deletion
    task.wait(duration or 5)
    local destroyTween = TweenService:Create(notification, TweenInfoSetting, { TextTransparency = 1 })
    destroyTween:Play() 
    destroyTween.Completed:Wait() 
    notification:Destroy() 
end

TextBox.Focused:Connect(function() 
    if TextBox.Text == sampleText then
        TextBox.Text = sampleTextRaw
    end
end)

TextBox.FocusLost:Connect(function(enterPressed)
    if enterPressed and TextBox.Text ~= "" then
        ProcessCommand(TextBox.Text)
        TextBox.Text = ""
    end
    if TextBox.Text == sampleTextRaw then
        TextBox.Text = sampleText
    end
end)

-- 🎭 GUI Dragging Fix
local dragging, dragInput, dragStart, startPos = false, nil, nil, nil

local function update(input)
    if dragging then
        local delta = input.Position - dragStart
        Frame.Position = UDim2.new(
            startPos.X.Scale, startPos.X.Offset + delta.X,
            startPos.Y.Scale, startPos.Y.Offset + delta.Y
        )
    end
end

Frame.InputBegan:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
        dragging = true
        dragStart = input.Position
        startPos = Frame.Position
        input.Changed:Connect(function()
            if input.UserInputState == Enum.UserInputState.End then
                dragging = false
            end
        end)
    end
end)

Frame.InputChanged:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch then
        dragInput = input
    end
end)

UserInputService.InputChanged:Connect(function(input)
    if input == dragInput and dragging then
        update(input)
    end
end)

-- 🎉 Notify Script Loaded
Notify("Script Loaded", "Fixed GUI dragging & improved ID monitoring!", 10, "thank you my goat")
FiddleWithPrompts(workspace.Map)
-- FiddleWithAllPrompts() 
-- CreateNotification("NIKHIL_FBI is raiding your house!", Color3.new(255, 0, 0), 5)
CreateNotification("Ниггер", Color3.new(0, 255, 0), 5)
-- PlaySound() 
